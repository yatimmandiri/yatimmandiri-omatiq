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

    public function apiKey(): string
    {
        return (string) config('services.penyaluran.api_key', 'rPoVsZQKlLnV8nY3lDvcekFQvGzTSX89TDO48MOB');
    }

    private function client(?string $token = null)
    {
        $client = Http::baseUrl($this->baseUrl())
            ->acceptJson()
            ->withoutVerifying()
            ->timeout(10)
            ->retry(2, 200, throw: false);

        $apiKey = $this->apiKey();
        if ($apiKey !== '') {
            $client = $client->withHeaders([
                'X-API-KEY' => $apiKey,
            ]);
        }

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
        $endpoint = 'api/v1/guru/login';

        try {
            $response = $this->client()->post($endpoint, [
                'phone' => $phone,
            ]);
        } catch (\Throwable $e) {
            Log::error("Penyaluran API Connection Error on {$endpoint}", [
                'endpoint' => $endpoint,
                'phone' => $phone,
                'error_class' => get_class($e),
                'error_message' => $e->getMessage(),
            ]);

            throw new \RuntimeException('Tidak dapat terhubung ke server Penyaluran. Server sedang dalam pemeliharaan atau koneksi terputus. Silakan coba beberapa saat lagi.');
        }

        $this->assertSuccess($response, $endpoint, ['phone' => $phone]);

        $data = $response->json();

        $token = $data['token'] ?? $data['data']['token'] ?? $data['access_token'] ?? null;

        if (! $token) {
            Log::warning("Penyaluran login response missing token on {$endpoint}", [
                'endpoint' => $endpoint,
                'phone' => $phone,
                'response' => $data,
            ]);

            throw new \RuntimeException('Token autentikasi tidak ditemukan pada respon server Penyaluran.');
        }

        return $token;
    }

    public function me(string $token, bool $force = false): array
    {
        if (! $force && session()->has('penyaluran_me')) {
            $sessionMe = session()->get('penyaluran_me');
            if (is_array($sessionMe) && ! empty($sessionMe)) {
                return $sessionMe;
            }
        }

        $cacheKey = 'penyaluran:me:'.sha1($token);

        if ($force) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, 300, function () use ($token) {
            $response = $this->client($token)->get('api/v1/guru/me');
            $this->assertSuccess($response);

            return $response->json('data') ?? $response->json();
        });

        if (is_array($data) && ! empty($data)) {
            session()->put('penyaluran_me', $data);
            if (isset($data['sanggars']) && is_array($data['sanggars'])) {
                session()->put('penyaluran_sanggars', $data['sanggars']);
            }
            if (isset($data['students']) && is_array($data['students'])) {
                session()->put('penyaluran_students', $data['students']);
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
    public function students(string $token, ?int $sanggarId = null, bool $force = false): array
    {
        // 1. Check session first if available and not forced
        if (! $force && session()->has('penyaluran_students')) {
            $rawStudents = session()->get('penyaluran_students');
            if (is_array($rawStudents) && ! empty($rawStudents)) {
                $guruSanggars = session()->get('penyaluran_sanggars') ?? [];
                $defaultKantor = session()->get('penyaluran_me')['kantor_name'] ?? null;

                if ($sanggarId !== null) {
                    $filtered = collect($rawStudents)->filter(function (array $s) use ($sanggarId, $guruSanggars) {
                        if (isset($s['sanggar_id']) && $s['sanggar_id'] !== null && $s['sanggar_id'] !== '') {
                            return (int) $s['sanggar_id'] === (int) $sanggarId;
                        }
                        if (isset($s['sanggar_ids']) && is_array($s['sanggar_ids']) && ! empty($s['sanggar_ids'])) {
                            return in_array($sanggarId, array_map('intval', $s['sanggar_ids']), true);
                        }
                        // If student does not have explicit sanggar_id in Penyaluran, check if requested sanggar belongs to this guru
                        if (collect($guruSanggars)->contains(fn ($gs) => (int) ($gs['id'] ?? 0) === (int) $sanggarId)) {
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

        if ($force) {
            $this->forgetStudentsCache($token);
        }

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

                session()->put('penyaluran_students', $rawStudents);
                if (! empty($guruSanggars)) {
                    session()->put('penyaluran_sanggars', $guruSanggars);
                }

                if ($sanggarId !== null) {
                    $rawStudents = collect($rawStudents)->filter(function (array $s) use ($sanggarId, $guruSanggars) {
                        if (isset($s['sanggar_id']) && $s['sanggar_id'] !== null && $s['sanggar_id'] !== '') {
                            return (int) $s['sanggar_id'] === (int) $sanggarId;
                        }
                        if (isset($s['sanggar_ids']) && is_array($s['sanggar_ids']) && ! empty($s['sanggar_ids'])) {
                            return in_array($sanggarId, array_map('intval', $s['sanggar_ids']), true);
                        }
                        // If student does not have explicit sanggar_id, check if guru has matching sanggar
                        if (collect($guruSanggars)->contains(fn ($gs) => (int) ($gs['id'] ?? 0) === (int) $sanggarId)) {
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
                $endpoint = 'api/v1/guru/students';
                $response = $this->client($token)->get($endpoint);
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
                $sanggars = $this->sanggars($token, enrich: false);
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

        session()->forget([
            'penyaluran_me',
            'penyaluran_sanggars',
            'penyaluran_students',
        ]);

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
        $endpoint = 'api/v1/guru/students';

        try {
            $response = $this->client($token)->get($endpoint, ['sanggar_id' => $sanggarId]);
        } catch (\Throwable $e) {
            Log::error("Penyaluran API Connection Error on {$endpoint}", [
                'endpoint' => $endpoint,
                'sanggar_id' => $sanggarId,
                'error_class' => get_class($e),
                'error_message' => $e->getMessage(),
            ]);

            return [];
        }

        $this->assertSuccess($response, $endpoint, ['sanggar_id' => $sanggarId]);

        $data = $response->json('data');
        if (! is_array($data)) {
            return [];
        }

        return $this->normalizeStudents($data, $sanggarId);
    }

    private function normalizeStudents(array $data, ?int $sanggarId = null, array $guruSanggars = [], ?string $defaultKantorName = null): array
    {
        $normalized = collect($data)->map(function (array $s) use ($sanggarId, $guruSanggars, $defaultKantorName) {
            $gender = $s['gender'] ?? $s['jenis_kelamin'] ?? $s['jk'] ?? null;
            if ($gender === 'L' || $gender === 'l' || $gender === 'M' || $gender === 'male') {
                $gender = 'male';
            } elseif ($gender === 'P' || $gender === 'p' || $gender === 'F' || $gender === 'female') {
                $gender = 'female';
            }

            $nestedSanggarId = null;
            if (isset($s['sanggar']) && is_array($s['sanggar'])) {
                $nestedSanggarId = $s['sanggar']['id'] ?? $s['sanggar']['sanggar_id'] ?? null;
            }

            $studentSanggarId = $s['sanggar_id'] ?? $s['sanggarId'] ?? $nestedSanggarId ?? $sanggarId;
            if (! $studentSanggarId && count($guruSanggars) === 1) {
                $studentSanggarId = $guruSanggars[0]['id'] ?? null;
            }

            $sanggarIds = $s['sanggar_ids'] ?? ($studentSanggarId ? [$studentSanggarId] : collect($guruSanggars)->pluck('id')->filter()->values()->all());

            $sanggarName = $s['sanggar_name'] ?? ($s['sanggar']['name'] ?? $s['sanggar']['nama'] ?? null);
            if (! $sanggarName && $studentSanggarId) {
                $foundSanggar = collect($guruSanggars)->firstWhere('id', $studentSanggarId);
                $sanggarName = $foundSanggar['name'] ?? null;
            }

            $schoolName = $s['school_name'] ?? $s['sekolah_name'] ?? $s['nama_sekolah'] ?? ($s['school']['name'] ?? $s['sekolah']['nama'] ?? null);
            $schoolLevel = $s['school_level'] ?? $s['jenjang'] ?? $s['level'] ?? $s['tingkat'] ?? ($s['school']['level'] ?? $s['sekolah']['jenjang'] ?? null);
            $grade = $s['class'] ?? $s['grade'] ?? $s['kelas'] ?? null;
            $guardianName = $s['guardian_name'] ?? $s['parent_name'] ?? $s['wali_name'] ?? ($s['wali']['name'] ?? $s['wali']['nama'] ?? $s['parent']['name'] ?? null);
            $guardianPhone = $s['guardian_phone'] ?? $s['parent_phone'] ?? $s['wali_phone'] ?? ($s['wali']['phone'] ?? $s['wali']['no_hp'] ?? $s['parent']['phone'] ?? null);

            $normalizedAttrs = [
                'student_id' => $s['student_id'] ?? $s['id'] ?? null,
                'name' => $s['name'] ?? $s['full_name'] ?? $s['nama'] ?? null,
                'nickname' => $s['nickname'] ?? $s['nama_panggilan'] ?? null,
                'nik' => $s['nik'] ?? $s['no_ktp'] ?? $s['no_nik'] ?? null,
                'nis' => $s['nis'] ?? $s['no_nis'] ?? null,
                'gender' => $gender,
                'school_name' => $schoolName,
                'school_level' => $schoolLevel,
                'class' => $grade,
                'birth_place' => $s['birth_place'] ?? $s['tempat_lahir'] ?? null,
                'birth_date' => $s['birth_date'] ?? $s['tanggal_lahir'] ?? $s['tgl_lahir'] ?? null,
                'address' => $s['address'] ?? $s['alamat'] ?? null,
                'province_id' => $s['province_id'] ?? $s['provinsi_id'] ?? $s['province_name'] ?? $s['provinsi_name'] ?? $s['province'] ?? $s['provinsi'] ?? null,
                'regency_id' => $s['regency_id'] ?? $s['kabupaten_id'] ?? $s['kota_id'] ?? $s['regency_name'] ?? $s['kabupaten_name'] ?? $s['kota_name'] ?? $s['regency'] ?? $s['kabupaten'] ?? $s['kota'] ?? null,
                'district_id' => $s['district_id'] ?? $s['kecamatan_id'] ?? $s['district_name'] ?? $s['kecamatan_name'] ?? $s['district'] ?? $s['kecamatan'] ?? null,
                'village_id' => $s['village_id'] ?? $s['desa_id'] ?? $s['kelurahan_id'] ?? $s['village_name'] ?? $s['desa_name'] ?? $s['kelurahan_name'] ?? $s['village'] ?? $s['desa'] ?? $s['kelurahan'] ?? null,
                'guardian_name' => $guardianName,
                'guardian_phone' => $guardianPhone,
                'sanggar_id' => $studentSanggarId,
                'sanggar_ids' => $sanggarIds,
                'sanggar_name' => $sanggarName,
                'kantor_name' => $s['kantor_name'] ?? $s['branch'] ?? $defaultKantorName ?? ($guruSanggars[0]['kantor_name'] ?? null),
                'type' => $s['type'] ?? null,
                'teacher_id' => $s['teacher_id'] ?? null,
                'status' => filter_var($s['status'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ];

            return array_merge($s, $normalizedAttrs);
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
        $endpoint = 'api/v1/guru/me';

        try {
            $response = $this->client($token)->put($endpoint, $attributes);
        } catch (\Throwable $e) {
            Log::error("Penyaluran API Connection Error on PUT {$endpoint}", [
                'endpoint' => $endpoint,
                'attributes' => $attributes,
                'error_class' => get_class($e),
                'error_message' => $e->getMessage(),
            ]);

            throw new \RuntimeException('Tidak dapat terhubung ke server Penyaluran untuk memperbarui profil. Silakan coba beberapa saat lagi.');
        }

        $this->assertSuccess($response, $endpoint, $attributes);

        Cache::forget('penyaluran:me:'.sha1($token));

        $data = $response->json('data') ?? $response->json();

        if (session()->has('penyaluran_me')) {
            $me = session()->get('penyaluran_me', []);
            if (is_array($me)) {
                session()->put('penyaluran_me', array_merge($me, $attributes));
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
        $endpoint = "api/v1/guru/students/{$studentId}";

        try {
            $response = $this->client($token)->put($endpoint, $attributes);
        } catch (\Throwable $e) {
            Log::error("Penyaluran API Connection Error on PUT {$endpoint}", [
                'endpoint' => $endpoint,
                'student_id' => $studentId,
                'attributes' => $attributes,
                'error_class' => get_class($e),
                'error_message' => $e->getMessage(),
            ]);

            throw new \RuntimeException('Tidak dapat terhubung ke server Penyaluran untuk memperbarui data santri. Silakan coba beberapa saat lagi.');
        }

        $this->assertSuccess($response, $endpoint, $attributes);

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
     * Parse any standard/custom Laravel paginated or wrapped JSON response.
     *
     * @return array{items: array, last_page: int, total: int}
     */
    public static function parsePaginatedResponse(mixed $json): array
    {
        if (! is_array($json) || empty($json)) {
            return ['items' => [], 'last_page' => 1, 'total' => 0];
        }

        $lastPage = $json['last_page']
            ?? $json['meta']['last_page']
            ?? ($json['data']['last_page'] ?? null)
            ?? ($json['pagination']['last_page'] ?? null)
            ?? 1;

        $total = $json['total']
            ?? $json['meta']['total']
            ?? ($json['data']['total'] ?? null)
            ?? ($json['pagination']['total'] ?? null)
            ?? null;

        $items = [];
        if (isset($json['data']) && is_array($json['data'])) {
            if (isset($json['data']['data']) && is_array($json['data']['data'])) {
                $items = $json['data']['data'];
            } elseif (isset($json['data']['sanggars']) && is_array($json['data']['sanggars'])) {
                $items = $json['data']['sanggars'];
            } else {
                $items = $json['data'];
            }
        } elseif (isset($json['sanggars']) && is_array($json['sanggars'])) {
            if (isset($json['sanggars']['data']) && is_array($json['sanggars']['data'])) {
                $items = $json['sanggars']['data'];
            } else {
                $items = $json['sanggars'];
            }
        } elseif (array_is_list($json)) {
            $items = $json;
        }

        if (! empty($items) && is_array($items) && ! array_is_list($items)) {
            $firstKey = array_key_first($items);
            if (is_numeric($firstKey) || is_array(reset($items))) {
                $items = array_values($items);
            }
        }

        if (! is_array($items)) {
            $items = [];
        }

        return [
            'items' => array_values($items),
            'last_page' => max(1, (int) $lastPage),
            'total' => $total !== null ? (int) $total : count($items),
        ];
    }

    /**
     * Get all sanggars from Penyaluran API (GET api/v1/sanggars) using X-API-KEY header.
     * Endpoint: https://penyaluran.yatimmandiri.org/api/v1/sanggars with header X-API-KEY.
     * Handles all Laravel pagination shapes and aggregates all available pages.
     *
     * @return array<int, array>
     */
    public function allSanggars(array $queryParams = [], bool $force = false): array
    {
        $cacheKey = 'penyaluran:sanggars:all:'.md5(json_encode($queryParams));

        if ($force || request()->has('refresh')) {
            Cache::forget($cacheKey);
        }

        $cached = Cache::get($cacheKey);
        if (! $force && ! empty($cached) && is_array($cached)) {
            return $cached;
        }

        $endpoint = 'api/v1/sanggars';
        $allData = [];
        $page = 1;
        $lastPage = 1;

        do {
            try {
                $query = array_merge(['per_page' => 100], $queryParams, [
                    'page' => $page,
                ]);

                $response = $this->client()->get($endpoint, $query);

                // Fallback only on first page if primary endpoint not successful
                if (! $response->successful() && $page === 1) {
                    $endpoint = 'api/v1/guru/sanggars';
                    $response = $this->client()->get($endpoint, $query);
                }
            } catch (\Throwable $e) {
                Log::error("Penyaluran API Connection Error on {$endpoint}", [
                    'endpoint' => $endpoint,
                    'page' => $page,
                    'error_class' => get_class($e),
                    'error_message' => $e->getMessage(),
                ]);

                break;
            }

            if (! $response->successful()) {
                Log::error("Penyaluran API Error on {$endpoint}", [
                    'endpoint' => $endpoint,
                    'page' => $page,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                break;
            }

            $parsed = self::parsePaginatedResponse($response->json());
            $items = $parsed['items'];
            $lastPage = $parsed['last_page'];

            if (! empty($items)) {
                $allData = array_merge($allData, $items);
            } else {
                break;
            }

            $page++;
        } while ($page <= $lastPage && $page <= 50);

        $normalized = ! empty($allData) ? collect($this->normalizeSanggars($allData))->unique('id')->values()->all() : [];

        if (! empty($normalized)) {
            Cache::put($cacheKey, $normalized, 300);
        } else {
            Cache::forget($cacheKey);
        }

        return $normalized;
    }

    /**
     * Normalize sanggars attributes to standard format.
     */
    public function normalizeSanggars(array $data): array
    {
        return collect($data)->map(function ($s, $idx) {
            if (! is_array($s)) {
                return [
                    'id' => $idx + 1,
                    'name' => (string) $s,
                    'type' => 'Reguler',
                    'kantor_name' => '-',
                    'total_students' => 0,
                    'address' => null,
                ];
            }

            $id = $s['id'] ?? $s['sanggar_id'] ?? $s['id_sanggar'] ?? ($idx + 1);

            $name = $s['name'] ?? $s['nama'] ?? $s['nama_sanggar'] ?? $s['sanggar_name'] ?? $s['title'] ?? null;
            if (! $name && isset($s['sanggar']) && is_string($s['sanggar'])) {
                $name = $s['sanggar'];
            }

            $type = $s['type'] ?? $s['tipe'] ?? $s['jenis'] ?? $s['kategori'] ?? $s['program'] ?? ($s['sanggar_type']['name'] ?? $s['sanggar_type']['code'] ?? null) ?? 'Reguler';

            $kantor = $s['kantor_name'] ?? $s['kantor'] ?? $s['cabang'] ?? $s['nama_kantor'] ?? $s['nama_cabang'] ?? $s['branch'] ?? null;
            if (is_array($kantor)) {
                $kantor = $kantor['name'] ?? $kantor['nama'] ?? $kantor['nama_cabang'] ?? null;
            }

            $totalStudents = $s['total_students'] ?? $s['santri_count'] ?? $s['students_count'] ?? $s['jumlah_santri'] ?? $s['total_santri'] ?? 0;
            if (is_array($totalStudents)) {
                $totalStudents = count($totalStudents);
            }

            $address = $s['address'] ?? $s['alamat'] ?? $s['alamat_lengkap'] ?? $s['lokasi'] ?? null;

            return array_merge($s, [
                'id' => $id ? (int) $id : ($idx + 1),
                'name' => $name ?? '-',
                'type' => is_string($type) ? $type : 'Reguler',
                'kantor_name' => is_string($kantor) ? $kantor : null,
                'total_students' => (int) $totalStudents,
                'address' => is_string($address) ? $address : null,
            ]);
        })->values()->all();
    }

    /**
     * Get all teachers from Penyaluran API (GET api/v1/teachers) using X-API-KEY header.
     * Endpoint: https://penyaluran.yatimmandiri.org/api/v1/teachers with header X-API-KEY.
     * Handles all Laravel pagination shapes and aggregates all available pages.
     *
     * @return array<int, array>
     */
    public function allTeachers(array $queryParams = [], bool $force = false): array
    {
        $cacheKey = 'penyaluran:teachers:all:'.md5(json_encode($queryParams));

        if ($force || request()->has('refresh')) {
            Cache::forget($cacheKey);
        }

        $cached = Cache::get($cacheKey);
        if (! $force && ! empty($cached) && is_array($cached)) {
            return $cached;
        }

        $endpoint = 'api/v1/teachers';
        $allData = [];
        $page = 1;
        $lastPage = 1;

        do {
            try {
                $query = array_merge(['per_page' => 100], $queryParams, [
                    'page' => $page,
                ]);

                $response = $this->client()->get($endpoint, $query);
            } catch (\Throwable $e) {
                Log::error("Penyaluran API Connection Error on {$endpoint}", [
                    'endpoint' => $endpoint,
                    'page' => $page,
                    'error_class' => get_class($e),
                    'error_message' => $e->getMessage(),
                ]);

                break;
            }

            if (! $response->successful()) {
                Log::error("Penyaluran API Error on {$endpoint}", [
                    'endpoint' => $endpoint,
                    'page' => $page,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                break;
            }

            $parsed = self::parsePaginatedResponse($response->json());
            $items = $parsed['items'];
            $lastPage = $parsed['last_page'];

            if (! empty($items)) {
                $allData = array_merge($allData, $items);
            } else {
                break;
            }

            $page++;
        } while ($page <= $lastPage && $page <= 500);

        $normalized = ! empty($allData) ? collect($this->normalizeTeachers($allData))->unique(fn ($t) => $t['id'] ?? $t['code'] ?? $t['email'] ?? $t['phone'])->values()->all() : [];

        if (! empty($normalized)) {
            Cache::put($cacheKey, $normalized, 300);
        } else {
            Cache::forget($cacheKey);
        }

        return $normalized;
    }

    /**
     * Normalize teachers attributes to standard format.
     */
    public function normalizeTeachers(array $data): array
    {
        return collect($data)->map(function ($s, $idx) {
            if (! is_array($s)) {
                return [
                    'id' => $idx + 1,
                    'penyaluran_id' => $idx + 1,
                    'teacher_id' => $idx + 1,
                    'penyaluran_code' => null,
                    'code' => null,
                    'name' => (string) $s,
                    'phone' => null,
                    'email' => null,
                    'kantor_id' => null,
                    'kantor_name' => null,
                    'branch' => null,
                    'email_verified_at' => null,
                    'created_at' => null,
                    'status' => true,
                ];
            }

            $id = $s['id'] ?? $s['teacher_id'] ?? $s['guru_id'] ?? $s['user_id'] ?? ($idx + 1);
            $name = $s['name'] ?? $s['nama'] ?? $s['nama_guru'] ?? $s['full_name'] ?? $s['nama_lengkap'] ?? null;
            $code = $s['code'] ?? $s['penyaluran_code'] ?? $s['kode'] ?? $s['kode_guru'] ?? null;
            $phone = $s['phone'] ?? $s['hp'] ?? $s['no_hp'] ?? $s['nomor_hp'] ?? $s['telephone'] ?? null;
            $email = $s['email'] ?? null;
            $kantorId = $s['kantor_id'] ?? $s['branch_id'] ?? ($s['kantor']['id'] ?? null) ?? null;
            $kantorName = $s['kantor_name'] ?? $s['kantor'] ?? $s['cabang'] ?? $s['nama_kantor'] ?? ($s['kantor']['name'] ?? null) ?? null;
            if (is_array($kantorName)) {
                $kantorName = $kantorName['name'] ?? $kantorName['nama'] ?? null;
            }
            $positions = $s['positions'] ?? $s['jabatan'] ?? [];
            $sanggars = $s['sanggars'] ?? $s['sanggar_teachers'] ?? [];

            return array_merge($s, [
                'id' => $id ? (int) $id : ($idx + 1),
                'penyaluran_id' => $id ? (int) $id : null,
                'teacher_id' => $id ? (int) $id : null,
                'penyaluran_code' => $code,
                'code' => $code,
                'name' => $name ?? '-',
                'phone' => $phone,
                'email' => $email,
                'kantor_id' => $kantorId ? (int) $kantorId : null,
                'kantor_name' => is_string($kantorName) ? $kantorName : null,
                'branch' => is_string($kantorName) ? $kantorName : null,
                'positions' => $positions,
                'sanggars' => $sanggars,
                'email_verified_at' => $s['email_verified_at'] ?? ($email ? now()->toIso8601String() : null),
                'created_at' => $s['created_at'] ?? null,
                'status' => filter_var($s['status'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ]);
        })->values()->all();
    }

    /**
     * Get all students from Penyaluran API (GET api/v1/students) using X-API-KEY header.
     * Endpoint: https://penyaluran.yatimmandiri.org/api/v1/students with header X-API-KEY.
     * Handles all Laravel pagination shapes and aggregates all available pages.
     *
     * @return array<int, array>
     */
    public function allStudents(array $queryParams = [], bool $force = false): array
    {
        $cacheKey = 'penyaluran:students:all:'.md5(json_encode($queryParams));

        if ($force || request()->has('refresh')) {
            Cache::forget($cacheKey);
        }

        $cached = Cache::get($cacheKey);
        if (! $force && ! empty($cached) && is_array($cached)) {
            return $cached;
        }

        $endpoint = 'api/v1/students';
        $allData = [];
        $page = 1;
        $lastPage = 1;

        do {
            try {
                $query = array_merge(['per_page' => 100], $queryParams, [
                    'page' => $page,
                ]);

                $response = $this->client()->get($endpoint, $query);
            } catch (\Throwable $e) {
                Log::error("Penyaluran API Connection Error on {$endpoint}", [
                    'endpoint' => $endpoint,
                    'page' => $page,
                    'error_class' => get_class($e),
                    'error_message' => $e->getMessage(),
                ]);

                break;
            }

            if (! $response->successful()) {
                Log::error("Penyaluran API Error on {$endpoint}", [
                    'endpoint' => $endpoint,
                    'page' => $page,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                break;
            }

            $parsed = self::parsePaginatedResponse($response->json());
            $items = $parsed['items'];
            $lastPage = $parsed['last_page'];

            if (! empty($items)) {
                $allData = array_merge($allData, $items);
            } else {
                break;
            }

            $page++;
        } while ($page <= $lastPage && $page <= 500);

        $normalized = ! empty($allData) ? collect($this->normalizeGlobalStudents($allData))->unique('id')->values()->all() : [];

        if (! empty($normalized)) {
            Cache::put($cacheKey, $normalized, 300);
        } else {
            Cache::forget($cacheKey);
        }

        return $normalized;
    }

    /**
     * Normalize global students (api/v1/students) to standard format.
     */
    public function normalizeGlobalStudents(array $data): array
    {
        return collect($data)->map(function ($s, $idx) {
            if (! is_array($s)) {
                return [
                    'id' => $idx + 1,
                    'name' => (string) $s,
                    'nik' => null,
                    'kantor_name' => null,
                ];
            }

            $id = $s['id'] ?? $s['student_id'] ?? ($idx + 1);
            $name = $s['name'] ?? $s['nama'] ?? $s['full_name'] ?? null;
            $nik = $s['nik'] ?? null;
            $nis = $s['nis'] ?? null;
            $gender = $s['gender'] ?? null;
            if ($gender === 'L' || $gender === 'l') {
                $gender = 'L';
            } elseif ($gender === 'P' || $gender === 'p') {
                $gender = 'P';
            }
            $schoolName = $s['school_name'] ?? $s['sekolah_name'] ?? null;
            $schoolLevel = $s['school_level'] ?? null;
            $class = $s['class'] ?? $s['kelas'] ?? null;
            $kantorId = $s['kantor_id'] ?? ($s['kantor']['id'] ?? null) ?? null;
            $kantorName = $s['kantor_name'] ?? $s['kantor'] ?? null;
            if (is_array($kantorName)) {
                $kantorName = $kantorName['name'] ?? $kantorName['nama'] ?? null;
            }
            $sanggarName = null;
            if (isset($s['sanggar_students']) && is_array($s['sanggar_students']) && ! empty($s['sanggar_students'])) {
                $sanggarName = $s['sanggar_students'][0]['sanggar_name'] ?? $s['sanggar_students'][0]['sanggar']['name'] ?? null;
            } elseif (isset($s['sanggars']) && is_array($s['sanggars']) && ! empty($s['sanggars'])) {
                $sanggarName = $s['sanggars'][0]['name'] ?? null;
            }
            $teacherName = null;
            $teacherId = $s['teacher_id'] ?? null;
            if (isset($s['teacher_students']) && is_array($s['teacher_students']) && ! empty($s['teacher_students'])) {
                $teacherName = $s['teacher_students'][0]['teacher_name'] ?? $s['teacher_students'][0]['teacher']['name'] ?? null;
                $teacherId = $teacherId ?? $s['teacher_students'][0]['teacher_id'] ?? $s['teacher_students'][0]['teacher']['id'] ?? null;
            } elseif (isset($s['teachers']) && is_array($s['teachers']) && ! empty($s['teachers'])) {
                $teacherName = $s['teachers'][0]['name'] ?? null;
                $teacherId = $teacherId ?? $s['teachers'][0]['id'] ?? null;
            }

            return array_merge($s, [
                'id' => $id ? (int) $id : ($idx + 1),
                'student_id' => $id ? (int) $id : ($idx + 1),
                'name' => $name ?? '-',
                'full_name' => $name ?? '-',
                'nik' => $nik,
                'nis' => $nis,
                'gender' => $gender,
                'school_name' => $schoolName,
                'school_level' => $schoolLevel,
                'class' => $class,
                'grade' => $class,
                'kantor_id' => $kantorId ? (int) $kantorId : null,
                'kantor_name' => is_string($kantorName) ? $kantorName : null,
                'branch' => is_string($kantorName) ? $kantorName : null,
                'sanggar_name' => $sanggarName,
                'teacher_name' => $teacherName,
                'teacher_id' => $teacherId ? (int) $teacherId : null,
                'mentor_id' => $teacherId ? (int) $teacherId : null,
            ]);
        })->values()->all();
    }

    /**
     * Get sanggars list for authenticated guru.
     * Primary source: Session / GET api/v1/guru/me which provides sanggars array.
     */
    public function sanggars(string $token, bool $enrich = true): array
    {
        $sanggars = null;

        if (session()->has('penyaluran_sanggars')) {
            $sessionSanggars = session()->get('penyaluran_sanggars');
            if (is_array($sessionSanggars) && ! empty($sessionSanggars)) {
                $sanggars = $sessionSanggars;
            }
        }

        if ($sanggars === null) {
            try {
                $me = $this->me($token);
                if (isset($me['sanggars']) && is_array($me['sanggars']) && ! empty($me['sanggars'])) {
                    session()->put('penyaluran_sanggars', $me['sanggars']);
                    $sanggars = $me['sanggars'];
                }
            } catch (\Throwable $e) {
                // fall through to dedicated endpoint
            }
        }

        if ($sanggars === null) {
            $endpoint = 'api/v1/sanggars';

            try {
                $response = $this->client($token)->get($endpoint);
                if (! $response->successful()) {
                    $endpoint = 'api/v1/guru/sanggars';
                    $response = $this->client($token)->get($endpoint);
                }
            } catch (\Throwable $e) {
                Log::error("Penyaluran API Connection Error on {$endpoint}", [
                    'endpoint' => $endpoint,
                    'error_class' => get_class($e),
                    'error_message' => $e->getMessage(),
                ]);

                return [];
            }

            $this->assertSuccess($response, $endpoint);

            $data = $response->json('data') ?? $response->json();
            if (! is_array($data)) {
                return [];
            }

            if (! empty($data)) {
                session()->put('penyaluran_sanggars', $data);
            }

            $sanggars = $data;
        }

        if (! $enrich) {
            return $sanggars;
        }

        return $this->enrichSanggarsWithStudentCounts($sanggars, $token);
    }

    protected static bool $isEnrichingSanggars = false;

    /**
     * Enrich sanggars array with accurate total_students counts from students roster.
     */
    public function enrichSanggarsWithStudentCounts(array $sanggars, ?string $token = null): array
    {
        if (empty($sanggars)) {
            return [];
        }

        if (self::$isEnrichingSanggars) {
            return $sanggars;
        }

        self::$isEnrichingSanggars = true;
        try {
            $students = [];
            if ($token) {
                try {
                    $students = $this->students($token);
                } catch (\Throwable $e) {
                    $raw = session()->get('penyaluran_students', []);
                    $students = is_array($raw) ? $this->normalizeStudents($raw, null, $sanggars) : [];
                }
            } elseif (session()->has('penyaluran_students')) {
                $raw = session()->get('penyaluran_students', []);
                $students = is_array($raw) ? $this->normalizeStudents($raw, null, $sanggars) : [];
            }
        } finally {
            self::$isEnrichingSanggars = false;
        }

        $studentsCollection = collect($students);
        $totalStudents = $studentsCollection->count();
        $sanggarCount = count($sanggars);
        $isSingleSanggar = $sanggarCount === 1;

        $enriched = collect($sanggars)->map(function (array $s) use ($studentsCollection, $totalStudents, $isSingleSanggar) {
            $sanggarId = (int) ($s['id'] ?? 0);

            $matchedCount = $studentsCollection->filter(function (array $student) use ($sanggarId, $isSingleSanggar) {
                if ($isSingleSanggar) {
                    return true;
                }
                if (isset($student['sanggar_id']) && (int) $student['sanggar_id'] === $sanggarId) {
                    return true;
                }
                if (isset($student['sanggar_ids']) && is_array($student['sanggar_ids'])) {
                    return in_array($sanggarId, array_map('intval', $student['sanggar_ids']), true);
                }

                return false;
            })->count();

            $existing = isset($s['total_students']) && is_numeric($s['total_students']) ? (int) $s['total_students'] : 0;
            $count = max($existing, $matchedCount);

            if ($count === 0 && $isSingleSanggar && $totalStudents > 0) {
                $count = $totalStudents;
            }

            $s['total_students'] = $count;

            return $s;
        })->values();

        $sum = $enriched->sum(fn ($s) => (int) ($s['total_students'] ?? 0));
        if ($sum === 0 && $totalStudents > 0 && $sanggarCount > 0) {
            $enriched = $enriched->map(function ($s) use ($totalStudents) {
                $s['total_students'] = $totalStudents;

                return $s;
            });
        }

        return $enriched->all();
    }

    /**
     * Map raw error response into user-friendly message and log detailed context for /log-viewer.
     *
     * @throws \RuntimeException
     */
    private function assertSuccess(Response $response, string $endpoint = '', array $context = []): void
    {
        if ($response->successful()) {
            return;
        }

        $status = $response->status();
        $body = $response->json() ?? $response->body();
        $rawMessage = is_array($body) ? ($body['message'] ?? json_encode($body)) : (string) $body;

        // Log detailed error for Developer Tracking in /log-viewer
        Log::error("Penyaluran API Error [{$status}] on {$endpoint}", [
            'endpoint' => $endpoint,
            'url' => $this->baseUrl().'/'.ltrim($endpoint, '/'),
            'status' => $status,
            'request_data' => $this->sanitizeLogContext($context),
            'response_body' => is_array($body) ? $body : (strlen($rawMessage) > 1000 ? substr($rawMessage, 0, 1000).'...' : $rawMessage),
            'raw_message' => $rawMessage,
        ]);

        // Translate raw error into friendly Indonesian message for users
        $userFriendlyMessage = $this->resolveFriendlyErrorMessage($status, $rawMessage, $endpoint);

        throw new \RuntimeException($userFriendlyMessage, $status);
    }

    /**
     * Translate raw Penyaluran API error responses into user-friendly Indonesian messages.
     */
    public function resolveFriendlyErrorMessage(int $status, string $rawMessage, string $endpoint = ''): string
    {
        $lowerRaw = strtolower($rawMessage);

        // 1. Phone / Account Not Found (404 or specific keywords)
        if ($status === 404
            || str_contains($lowerRaw, 'tidak ditemukan')
            || str_contains($lowerRaw, 'not found')
            || str_contains($lowerRaw, 'unregistered')
            || str_contains($lowerRaw, 'belum terdaftar')
            || str_contains($lowerRaw, 'nomor tidak')
            || str_contains($lowerRaw, 'guru tidak ditemukan')
            || str_contains($lowerRaw, 'data guru tidak')
        ) {
            if (str_contains($endpoint, 'login') || str_contains($endpoint, 'guru')) {
                return 'Nomor HP tidak terdaftar sebagai Guru/Pembina di sistem Penyaluran. Pastikan nomor yang Anda masukkan sudah terdaftar.';
            }

            return 'Data tidak ditemukan di server Penyaluran.';
        }

        // 2. Routing / Method Not Allowed / 405 (e.g. "The GET method is not supported for route...")
        if ($status === 405
            || str_contains($lowerRaw, 'method is not supported')
            || str_contains($lowerRaw, 'method not allowed')
        ) {
            return 'Layanan sinkronisasi Penyaluran sedang dalam pemeliharaan/perbaikan. Silakan coba beberapa saat lagi.';
        }

        // 3. Unauthorized / Session Expired (401 / 403)
        if ($status === 401 || $status === 403) {
            return 'Sesi autentikasi Penyaluran telah berakhir atau tidak memiliki izin akses. Silakan login ulang.';
        }

        // 4. Server Errors & Maintenance (500, 502, 503, 504, HTML error pages)
        if ($status >= 500
            || str_contains($lowerRaw, 'server error')
            || str_contains($lowerRaw, '<!doctype html')
            || str_contains($lowerRaw, '<html')
            || str_contains($lowerRaw, 'bad gateway')
            || str_contains($lowerRaw, 'service unavailable')
            || str_contains($lowerRaw, 'gateway timeout')
        ) {
            return 'Server Penyaluran sedang mengalami gangguan atau pemeliharaan sistem. Silakan coba beberapa saat lagi.';
        }

        // 5. Validation Errors (422)
        if ($status === 422) {
            if (str_contains($lowerRaw, 'phone') || str_contains($lowerRaw, 'nomor')) {
                return 'Nomor HP yang dimasukkan tidak valid untuk sistem Penyaluran.';
            }

            if (! empty($rawMessage) && ! str_contains($lowerRaw, '{') && strlen($rawMessage) < 150) {
                return $rawMessage;
            }

            return 'Data yang dikirimkan tidak valid untuk server Penyaluran.';
        }

        // Default friendly fallback
        return 'Layanan sinkronisasi Penyaluran sedang dalam pemeliharaan/perbaikan. Silakan coba beberapa saat lagi.';
    }

    /**
     * Sanitize sensitive keys from log context.
     */
    private function sanitizeLogContext(array $context): array
    {
        $sensitiveKeys = ['password', 'password_confirmation', 'token', 'access_token', 'secret'];

        foreach ($context as $key => $value) {
            if (in_array(strtolower((string) $key), $sensitiveKeys, true)) {
                $context[$key] = '***REDACTED***';
            } elseif (is_array($value)) {
                $context[$key] = $this->sanitizeLogContext($value);
            }
        }

        return $context;
    }
}
