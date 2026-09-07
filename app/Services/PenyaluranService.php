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
            ->retry(2, 200, throw: false);

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
                'nickname' => $s['nickname'] ?? null,
                'nik' => $s['nik'] ?? null,
                'nis' => $s['nis'] ?? null,
                'gender' => $gender,
                'school_name' => $s['school_name'] ?? null,
                'school_level' => $s['school_level'] ?? $s['jenjang'] ?? $s['level'] ?? $s['tingkat'] ?? null,
                'class' => $s['class'] ?? $s['grade'] ?? null,
                'birth_place' => $s['birth_place'] ?? $s['tempat_lahir'] ?? null,
                'birth_date' => $s['birth_date'] ?? $s['tanggal_lahir'] ?? null,
                'address' => $s['address'] ?? $s['alamat'] ?? null,
                'guardian_name' => $s['guardian_name'] ?? $s['parent_name'] ?? $s['wali_name'] ?? null,
                'guardian_phone' => $s['guardian_phone'] ?? $s['parent_phone'] ?? $s['wali_phone'] ?? null,
                'sanggar_id' => $s['sanggar_id'] ?? $s['sanggarId'] ?? $sanggarId,
                'sanggar_name' => $s['sanggar_name'] ?? null,
                'kantor_name' => $s['kantor_name'] ?? $s['branch'] ?? null,
                'status' => $s['status'] ?? true,
            ];
        });

        return $normalized->unique(fn (array $s) => $s['student_id'] ?? null)->values()->all();
    }

    /**
     * Update guru profile on Penyaluran (PUT api/v1/guru/me). Invalidates me cache.
     *
     * @param  array{name?:string, email?:string}  $attributes
     *
     * @throws \RuntimeException
     */
    public function updateMe(string $token, array $attributes): array
    {
        $response = $this->client($token)->put('api/v1/guru/me', $attributes);
        $this->assertSuccess($response);

        Cache::forget('penyaluran:me:'.sha1($token));

        return $response->json('data') ?? $response->json();
    }

    /**
     * Update student data on Penyaluran (PUT api/v1/guru/students/{studentId}).
     *
     * @throws \RuntimeException
     */
    public function updateStudent(string $token, int|string $studentId, array $attributes): array
    {
        $response = $this->client($token)->put("api/v1/guru/students/{$studentId}", $attributes);
        $this->assertSuccess($response);

        return $response->json('data') ?? $response->json();
    }

    /**
     * Map and format student attributes to Penyaluran payload format.
     */
    public function formatStudentPayload(array $data): array
    {
        $payload = [];

        if (isset($data['name'])) {
            $payload['name'] = $data['name'];
        } elseif (isset($data['full_name'])) {
            $payload['name'] = $data['full_name'];
        }

        if (array_key_exists('nik', $data)) {
            $payload['nik'] = $data['nik'];
        }
        if (array_key_exists('nis', $data)) {
            $payload['nis'] = $data['nis'];
        }
        if (array_key_exists('nickname', $data)) {
            $payload['nickname'] = $data['nickname'];
        }
        if (isset($data['gender'])) {
            $gender = $data['gender'];
            if ($gender === 'male' || $gender === 'L') {
                $payload['gender'] = 'L';
            } elseif ($gender === 'female' || $gender === 'P') {
                $payload['gender'] = 'P';
            }
        }
        if (array_key_exists('birth_place', $data)) {
            $payload['birth_place'] = $data['birth_place'];
        }
        if (isset($data['birth_date'])) {
            $payload['birth_date'] = is_string($data['birth_date'])
                ? substr($data['birth_date'], 0, 10)
                : $data['birth_date']?->format('Y-m-d');
        }
        if (array_key_exists('phone', $data)) {
            $payload['phone'] = $data['phone'];
        }
        if (array_key_exists('address', $data)) {
            $payload['address'] = $data['address'];
        }
        if (array_key_exists('school_name', $data)) {
            $payload['school_name'] = $data['school_name'];
        }
        if (array_key_exists('school_level', $data)) {
            $payload['school_level'] = $data['school_level'];
        }
        if (isset($data['class'])) {
            $payload['class'] = (string) $data['class'];
        } elseif (isset($data['grade'])) {
            $payload['class'] = (string) $data['grade'];
        }
        if (array_key_exists('guardian_phone', $data)) {
            $payload['guardian_phone'] = $data['guardian_phone'];
        } elseif (array_key_exists('parent_phone', $data)) {
            $payload['guardian_phone'] = $data['parent_phone'];
            $payload['phone'] = $data['parent_phone'];
        }
        if (array_key_exists('guardian_name', $data)) {
            $payload['guardian_name'] = $data['guardian_name'];
        }
        if (array_key_exists('status', $data)) {
            $payload['status'] = (bool) $data['status'];
        } elseif (array_key_exists('is_active', $data)) {
            $payload['status'] = (bool) $data['is_active'];
        }

        return $payload;
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
