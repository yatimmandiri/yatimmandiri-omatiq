<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PenyaluranService
{
    public function baseUrl(): string
    {
        return rtrim((string) config('services.penyaluran.url'), '/');
    }

    private function client(?string $token = null)
    {
        $client = Http::baseUrl($this->baseUrl())
            ->acceptJson()
            ->timeout(8)
            ->retry(2, 200);

        if ($token) {
            $client = $client->withToken($token);
        }

        return $client;
    }

    /**
     * Login guru via phone, returns token string.
     *
     * @throws \RuntimeException
     */
    public function loginGuru(string $phone): string
    {
        $response = $this->client()->post('api/v1/guru/login', [
            'phone' => $phone,
        ]);

        $this->assertSuccess($response);

        $data = $response->json();

        $token = $data['token'] ?? $data['data']['token'] ?? $data['access_token'] ?? null;

        if (! $token) {
            Log::warning('penyaluran.login missing token', ['response' => $data]);
            throw new \RuntimeException('Token tidak ditemukan pada respon penyaluran.');
        }

        return $token;
    }

    public function me(string $token): array
    {
        $cacheKey = 'penyaluran:me:'.sha1($token);

        return Cache::remember($cacheKey, 300, function () use ($token) {
            $response = $this->client($token)->get('api/v1/guru/me');
            $this->assertSuccess($response);

            return $response->json('data') ?? $response->json();
        });
    }

    /**
     * Get students list for authenticated guru. Normalizes gender P/L → male/female, maps school_level.
     *
     * @return array<int, array{student_id:int, name:string, nik:?string, nis:?string, gender:?string, school_name:?string, school_level:?string, class:?string, birth_date:?string, status:bool}>
     */
    public function students(string $token): array
    {
        $response = $this->client($token)->get('api/v1/guru/students');
        $this->assertSuccess($response);

        $data = $response->json('data');
        if (! is_array($data)) {
            return [];
        }

        // Normalize fields: gender P/L → male/female, school_level variants, birth_date
        $normalized = collect($data)->map(function (array $s) {
            $gender = $s['gender'] ?? null;
            if ($gender === 'L') {
                $gender = 'male';
            } elseif ($gender === 'P') {
                $gender = 'female';
            }

            return [
                'student_id' => $s['student_id'] ?? $s['id'] ?? null,
                'name' => $s['name'] ?? $s['full_name'] ?? null,
                'nik' => $s['nik'] ?? null,
                'nis' => $s['nis'] ?? null,
                'gender' => $gender,
                'school_name' => $s['school_name'] ?? null,
                'school_level' => $s['school_level'] ?? $s['jenjang'] ?? $s['level'] ?? $s['tingkat'] ?? null,
                'class' => $s['class'] ?? $s['grade'] ?? null,
                'birth_date' => $s['birth_date'] ?? $s['tanggal_lahir'] ?? null,
                'status' => $s['status'] ?? true,
            ];
        });

        // Deduplicate by student_id (same binaan in 2 sanggars → 1x)
        return $normalized->unique(fn (array $s) => $s['student_id'] ?? null)->values()->all();
    }

    /**
     * Get sanggars list for authenticated guru.
     */
    public function sanggars(string $token): array
    {
        $response = $this->client($token)->get('api/v1/guru/sanggars');
        $this->assertSuccess($response);

        $data = $response->json('data');
        if (! is_array($data)) {
            return [];
        }

        return $data;
    }

    private function assertSuccess(Response $response): void
    {
        if ($response->successful()) {
            return;
        }

        $body = $response->json() ?? $response->body();
        $message = is_array($body) ? ($body['message'] ?? json_encode($body)) : $body;

        Log::warning('penyaluran.api failed', [
            'status' => $response->status(),
            'body' => $body,
        ]);

        throw new \RuntimeException($message ?: 'Gagal menghubungi server penyaluran.', $response->status());
    }
}
