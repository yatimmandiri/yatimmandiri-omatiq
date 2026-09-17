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
        if (request()?->hasSession() && request()->session()->has('penyaluran_me')) {
            $sessionMe = request()->session()->get('penyaluran_me');
            if (is_array($sessionMe) && ! empty($sessionMe)) {
                return $sessionMe;
            }
        }

        $cacheKey = 'penyaluran:me:'.sha1($token);

        $data = Cache::remember($cacheKey, 300, function () use ($token) {
            $response = $this->client($token)->get('api/v1/guru/me');
            $this->assertSuccess($response);

            return $response->json('data') ?? $response->json();
        });

        if (request()?->hasSession() && is_array($data) && ! empty($data)) {
            request()->session()->put('penyaluran_me', $data);
            if (isset($data['sanggars']) && is_array($data['sanggars'])) {
                request()->session()->put('penyaluran_sanggars', $data['sanggars']);
            }
            if (isset($data['students']) && is_array($data['students'])) {
                request()->session()->put('penyaluran_students', $data['students']);
            }
        }

        return $data;
    }

    /**
     * Get students list for authenticated guru.
     * Primary source: Session / GET api/v1/guru/me which provides students and sanggars directly in the profile response.
     * Normalizes gender P/L → male/female, maps school_level, and sanggar relations.
     *
     * @return array<int, array{student_id:int, name:string, nik:?string, nis:?string, gender:?string, school_name:?string, school_level:?string, class:?string, birth_date:?string, sanggar_id:?int, status:bool}>
     */
    public function students(string $token, ?int $sanggarId = null): array
    {
        // 1. Check session first if available
        if (request()?->hasSession() && request()->session()->has('penyaluran_students')) {
            $rawStudents = request()->session()->get('penyaluran_students');
            if (is_array($rawStudents) && ! empty($rawStudents)) {
                $guruSanggars = request()->session()->get('penyaluran_sanggars') ?? [];
                $defaultKantor = request()->session()->get('penyaluran_me')['kantor_name'] ?? null;

                if ($sanggarId !== null) {
                    $filtered = collect($rawStudents)->filter(function (array $s) use ($sanggarId, $guruSanggars) {
                        if (isset($s['sanggar_id']) && $s['sanggar_id'] !== null) {
                            return (int) $s['sanggar_id'] === (int) $sanggarId;
                        }
                        if (isset($s['sanggar_ids']) && is_array($s['sanggar_ids'])) {
                            return in_array($sanggarId, array_map('intval', $s['sanggar_ids']), true);
                        }
                        if (count($guruSanggars) === 1 && (int) ($guruSanggars[0]['id'] ?? 0) === (int) $sanggarId) {
                            return true;
                        }

                        return false;
                    })->values()->all();

                    return $this->normalizeStudents($filtered, $sanggarId, $guruSanggars, $defaultKantor);
                }

                return $this->normalizeStudents($rawStudents, null, $guruSanggars, $defaultKantor);
            }
        }

        $cacheKey = 'penyaluran:students:'.sha1($token).':'.($sanggarId ?? 'all');

        return Cache::remember($cacheKey, 120, function () use ($token, $sanggarId) {
            $me = null;
            try {
                $me = $this->me($token);
            } catch (\Throwable $e) {
                // fall through to legacy fallback
            }

            if ($me && isset($me['students']) && is_array($me['students'])) {
                $rawStudents = $me['students'];
                $guruSanggars = is_array($me['sanggars'] ?? null) ? $me['sanggars'] : [];

                if (request()?->hasSession()) {
                    request()->session()->put('penyaluran_students', $rawStudents);
                    if (! empty($guruSanggars)) {
                        request()->session()->put('penyaluran_sanggars', $guruSanggars);
                    }
                }

                if ($sanggarId !== null) {
                    $rawStudents = collect($rawStudents)->filter(function (array $s) use ($sanggarId, $guruSanggars) {
                        if (isset($s['sanggar_id']) && $s['sanggar_id'] !== null) {
                            return (int) $s['sanggar_id'] === (int) $sanggarId;
                        }
                        if (isset($s['sanggar_ids']) && is_array($s['sanggar_ids'])) {
                            return in_array($sanggarId, array_map('intval', $s['sanggar_ids']), true);
                        }
                        // If student does not have explicit sanggar_id, check if guru has matching sanggar
                        if (count($guruSanggars) === 1 && (int) ($guruSanggars[0]['id'] ?? 0) === (int) $sanggarId) {
                            return true;
                        }

                        return false;
                    })->values()->all();
                }

                return $this->normalizeStudents($rawStudents, $sanggarId, $guruSanggars, $me['kantor_name'] ?? null);
            }

            // Fallback for legacy or direct endpoint if me() didn't contain students
            if ($sanggarId !== null) {
                return $this->fetchStudentsForSanggar($token, $sanggarId);
            }

            // Backward-compatible aggregation: fetch per sanggar and merge deduped
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
        });
    }

    public function forgetStudentsCache(string $token): void
    {
        $baseKey = 'penyaluran:students:'.sha1($token);
        Cache::forget($baseKey.':all');
        Cache::forget('penyaluran:me:'.sha1($token));

        if (request()?->hasSession()) {
            request()->session()->forget([
                'penyaluran_me',
                'penyaluran_sanggars',
                'penyaluran_students',
            ]);
        }

        try {
            $sanggars = $this->sanggars($token);
            foreach ($sanggars as $s) {
                if (isset($s['id'])) {
                    Cache::forget($baseKey.':'.$s['id']);
                }
            }
        } catch (\Throwable $e) {
        }
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

    private function normalizeStudents(array $data, ?int $sanggarId = null, array $guruSanggars = [], ?string $defaultKantorName = null): array
    {
        $normalized = collect($data)->map(function (array $s) use ($sanggarId, $guruSanggars, $defaultKantorName) {
            $gender = $s['gender'] ?? null;
            if ($gender === 'L') {
                $gender = 'male';
            } elseif ($gender === 'P') {
                $gender = 'female';
            }

            $studentSanggarId = $s['sanggar_id'] ?? $s['sanggarId'] ?? $sanggarId;
            if (! $studentSanggarId && count($guruSanggars) === 1) {
                $studentSanggarId = $guruSanggars[0]['id'] ?? null;
            }

            $sanggarIds = $s['sanggar_ids'] ?? ($studentSanggarId ? [$studentSanggarId] : collect($guruSanggars)->pluck('id')->filter()->values()->all());

            $sanggarName = $s['sanggar_name'] ?? null;
            if (! $sanggarName && $studentSanggarId) {
                $foundSanggar = collect($guruSanggars)->firstWhere('id', $studentSanggarId);
                $sanggarName = $foundSanggar['name'] ?? null;
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
                'province_id' => $s['province_id'] ?? $s['provinsi_id'] ?? $s['province_name'] ?? $s['provinsi_name'] ?? $s['province'] ?? $s['provinsi'] ?? null,
                'regency_id' => $s['regency_id'] ?? $s['kabupaten_id'] ?? $s['kota_id'] ?? $s['regency_name'] ?? $s['kabupaten_name'] ?? $s['kota_name'] ?? $s['regency'] ?? $s['kabupaten'] ?? $s['kota'] ?? null,
                'district_id' => $s['district_id'] ?? $s['kecamatan_id'] ?? $s['district_name'] ?? $s['kecamatan_name'] ?? $s['district'] ?? $s['kecamatan'] ?? null,
                'village_id' => $s['village_id'] ?? $s['desa_id'] ?? $s['kelurahan_id'] ?? $s['village_name'] ?? $s['desa_name'] ?? $s['kelurahan_name'] ?? $s['village'] ?? $s['desa'] ?? $s['kelurahan'] ?? null,
                'guardian_name' => $s['guardian_name'] ?? $s['parent_name'] ?? $s['wali_name'] ?? null,
                'guardian_phone' => $s['guardian_phone'] ?? $s['parent_phone'] ?? $s['wali_phone'] ?? null,
                'sanggar_id' => $studentSanggarId,
                'sanggar_ids' => $sanggarIds,
                'sanggar_name' => $sanggarName,
                'kantor_name' => $s['kantor_name'] ?? $s['branch'] ?? $defaultKantorName ?? ($guruSanggars[0]['kantor_name'] ?? null),
                'type' => $s['type'] ?? null,
                'teacher_id' => $s['teacher_id'] ?? null,
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

        $data = $response->json('data') ?? $response->json();

        if (request()?->hasSession()) {
            $me = request()->session()->get('penyaluran_me', []);
            if (is_array($me)) {
                request()->session()->put('penyaluran_me', array_merge($me, $attributes));
            }
        }

        return $data;
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

        $this->forgetStudentsCache($token);

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
        if (array_key_exists('province_id', $data) && filled($data['province_id'])) {
            $payload['province_id'] = $data['province_id'];
            $payload['provinsi_id'] = $data['province_id'];
        }
        if (array_key_exists('regency_id', $data) && filled($data['regency_id'])) {
            $payload['regency_id'] = $data['regency_id'];
            $payload['kabupaten_id'] = $data['regency_id'];
        }
        if (array_key_exists('district_id', $data) && filled($data['district_id'])) {
            $payload['district_id'] = $data['district_id'];
            $payload['kecamatan_id'] = $data['district_id'];
        }
        if (array_key_exists('village_id', $data) && filled($data['village_id'])) {
            $payload['village_id'] = $data['village_id'];
            $payload['desa_id'] = $data['village_id'];
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
     * Primary source: Session / GET api/v1/guru/me which provides sanggars array.
     */
    public function sanggars(string $token): array
    {
        if (request()?->hasSession() && request()->session()->has('penyaluran_sanggars')) {
            $sessionSanggars = request()->session()->get('penyaluran_sanggars');
            if (is_array($sessionSanggars) && ! empty($sessionSanggars)) {
                return $sessionSanggars;
            }
        }

        try {
            $me = $this->me($token);
            if (isset($me['sanggars']) && is_array($me['sanggars']) && ! empty($me['sanggars'])) {
                if (request()?->hasSession()) {
                    request()->session()->put('penyaluran_sanggars', $me['sanggars']);
                }

                return $me['sanggars'];
            }
        } catch (\Throwable $e) {
            // fall through to dedicated endpoint
        }

        $response = $this->client($token)->get('api/v1/guru/sanggars');
        $this->assertSuccess($response);

        $data = $response->json('data');
        if (! is_array($data)) {
            return [];
        }

        if (request()?->hasSession() && ! empty($data)) {
            request()->session()->put('penyaluran_sanggars', $data);
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
