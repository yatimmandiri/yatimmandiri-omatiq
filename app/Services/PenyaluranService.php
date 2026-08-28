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
     * sanggar_id is now required per API contract; if null, aggregates per sanggar and dedups.
     *
     * @return array<int, array{student_id:int, name:string, nik:?string, nis:?string, gender:?string, school_name:?string, school_level:?string, class:?string, birth_date:?string, sanggar_id:?int, status:bool}>
     */
    public function students(string $token, ?int $sanggarId = null): array
    {
        if ($sanggarId !== null) {
            return $this->fetchStudentsForSanggar($token, $sanggarId);
        }

        // Backward-compatible aggregation: fetch per sanggar and merge deduped
        // If API still allows without sanggar_id, try direct first
        try {
            $response = $this->client($token)->get('api/v1/guru/students');
            if ($response->successful()) {
                $data = $response->json('data');
                if (is_array($data) && ! empty($data)) {
                    return $this->normalizeStudents($data);
                }
            }
        } catch (\Throwable $e) {
            // fall through to per-sanggar aggregation
        }

        // Aggregate per sanggar
        try {
            $sanggars = $this->sanggars($token);
        } catch (\Throwable $e) {
            return [];
        }

        if (empty($sanggars)) {
            return [];
        }

        $all = collect();
        foreach ($sanggars as $sanggar) {
            $sid = (int) ($sanggar['id'] ?? 0);
            if (! $sid) {
                continue;
            }
            $students = $this->fetchStudentsForSanggar($token, $sid);
            foreach ($students as $s) {
                $s['sanggar_id'] = $sid;
                $all->push($s);
            }
        }

        // Group by student_id to keep all sanggar_ids for multi-sanggar students
        return $all->groupBy(fn (array $s) => $s['student_id'] ?? null)->map(function ($group) {
            $first = $group->first();
            $first['sanggar_ids'] = $group->pluck('sanggar_id')->filter()->unique()->values()->all();

            return $first;
        })->values()->all();
    }

    private function fetchStudentsForSanggar(string $token, int $sanggarId): array
    {
        $response = $this->client($token)->get('api/v1/guru/students', ['sanggar_id' => $sanggarId]);
        $this->assertSuccess($response);

        $data = $response->json('data');
        if (! is_array($data)) {
            return [];
        }

        return $this->normalizeStudents($data, $sanggarId);
    }

    private function normalizeStudents(array $data, ?int $sanggarId = null): array
    {
        $normalized = collect($data)->map(function (array $s) use ($sanggarId) {
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
                'sanggar_id' => $s['sanggar_id'] ?? $s['sanggarId'] ?? $sanggarId,
                'status' => $s['status'] ?? true,
            ];
        });

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
