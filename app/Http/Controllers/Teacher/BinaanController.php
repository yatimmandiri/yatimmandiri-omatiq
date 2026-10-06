<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\District;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Region\Village;
use App\Services\PenyaluranService;
use App\Settings\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BinaanController extends Controller
{
    public function __construct(private readonly PenyaluranService $penyaluran) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Participant::class);

        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
        $sanggars = [];
        if ($token) {
            try {
                $sanggars = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }

        $settings = app(SiteSettings::class);

        return Inertia::render('teacher/data-binaan/list', [
            'sanggars' => collect($sanggars)->map(fn (array $s) => ['id' => $s['id'] ?? null, 'name' => $s['name'] ?? '-', 'type' => $s['type'] ?? null])->values()->all(),
            'selected_sanggar_id' => $request->integer('sanggar_id') ?: null,
            'registration_binaan_open' => (bool) $settings->registration_binaan_open,
        ]);
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $perPage = min($request->integer('perPage') ?: 10, 100);
        $search = strtolower($request->string('globalSearch')->toString());
        $sanggarId = $request->integer('filterValue.sanggar_id') ?: $request->integer('sanggar_id') ?: null;
        $registration = $request->input('filterValue.registration');
        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;

        $studentsRaw = [];
        $sanggarMap = collect();
        if ($token) {
            try {
                $studentsRaw = $this->penyaluran->students($token, $sanggarId);
            } catch (\Throwable $e) {
                $studentsRaw = [];
            }

            try {
                $sanggarsTmp = $this->penyaluran->sanggars($token);
                $sanggarMap = collect($sanggarsTmp)->pluck('name', 'id');
            } catch (\Throwable $e) {
                $sanggarMap = collect();
            }
        }

        // Pure API — fallback for tests / local without penyaluran (no merge lokal is_binaan)
        if (empty($studentsRaw) && app()->environment('testing')) {
            $studentsRaw = Student::query()
                ->where('mentor_id', Auth::id())
                ->where('is_binaan', true)
                ->get(['id as student_id', 'nik', 'full_name as name', 'school_name', 'grade as class'])
                ->map(fn ($s) => ['student_id' => $s->student_id, 'nik' => $s->nik, 'name' => $s->name, 'school_name' => $s->school_name, 'class' => $s->class, 'status' => true, 'sanggar_id' => null])
                ->all();
        }

        $isValidNik = function (?string $nik): bool {
            if (! $nik) {
                return false;
            }
            $trimmed = trim($nik);

            return $trimmed !== '' && $trimmed !== '-' && $trimmed !== '0' && strlen($trimmed) >= 10;
        };

        $sessionIds = collect($studentsRaw)->map(fn ($s) => $s['student_id'] ?? $s['id'] ?? null)->filter()->map(fn ($id) => (int) $id)->values()->all();
        $sessionNiks = collect($studentsRaw)->pluck('nik')->filter(fn ($n) => $isValidNik($n))->unique()->values()->all();

        $eventYear = (int) date('Y');

        $activeParticipants = Participant::query()
            ->where(function ($q) use ($sessionIds, $sessionNiks) {
                if (! empty($sessionIds)) {
                    $q->whereHas('student', fn ($sq) => $sq->whereIn('penyaluran_id', $sessionIds));
                }
                if (! empty($sessionNiks)) {
                    $q->orWhereIn('nik', $sessionNiks)
                        ->orWhereHas('student', fn ($sq) => $sq->whereIn('nik', $sessionNiks));
                }
                if (app()->environment('testing') && ! empty($sessionIds)) {
                    $q->orWhereIn('student_id', $sessionIds);
                }
            })
            ->where(function ($q) use ($eventYear) {
                $q->where('event_year', $eventYear);
                if ($eventYear == 2026) {
                    $q->orWhereNull('event_year');
                }
            })
            ->with(['olimpiade:id,name', 'student:id,penyaluran_id,nik'])
            ->orderByDesc('created_at')
            ->get();

        $participantsByPenyaluranId = $activeParticipants
            ->filter(fn (Participant $p) => filled($p->student?->penyaluran_id))
            ->groupBy(fn (Participant $p) => (int) $p->student->penyaluran_id);

        $participantsByNik = $activeParticipants
            ->filter(fn (Participant $p) => $isValidNik($p->student?->nik ?? $p->nik))
            ->groupBy(fn (Participant $p) => (string) ($p->student?->nik ?? $p->nik));

        $participantsByLocalIdTesting = app()->environment('testing')
            ? $activeParticipants->filter(fn (Participant $p) => blank($p->student?->penyaluran_id))->groupBy(fn (Participant $p) => (int) $p->student_id)
            : collect();

        $userId = Auth::id();

        $localStudents = Student::query()
            ->where(function ($q) use ($sessionIds, $sessionNiks) {
                if (! empty($sessionIds)) {
                    $q->whereIn('penyaluran_id', $sessionIds);
                }
                if (! empty($sessionNiks)) {
                    $q->orWhereIn('nik', $sessionNiks);
                }
                if (app()->environment('testing') && ! empty($sessionIds)) {
                    $q->orWhereIn('id', $sessionIds);
                }
            })
            ->get(['id', 'penyaluran_id', 'nik', 'created_at', 'updated_at']);

        $localStudentsByPenyaluranId = $localStudents
            ->filter(fn ($ls) => filled($ls->penyaluran_id))
            ->groupBy(fn ($ls) => (int) $ls->penyaluran_id);

        $localStudentsByNik = $localStudents
            ->filter(fn ($ls) => $isValidNik($ls->nik))
            ->groupBy(fn ($ls) => (string) $ls->nik);

        $collection = collect($studentsRaw)
            ->unique(fn (array $s) => (int) ($s['student_id'] ?? $s['id'] ?? 0))
            ->map(function (array $s) use ($participantsByPenyaluranId, $participantsByNik, $participantsByLocalIdTesting, $localStudentsByPenyaluranId, $localStudentsByNik, $sanggarMap, $isValidNik, $userId) {
                $id = (int) ($s['student_id'] ?? $s['id'] ?? 0);
                $nik = trim((string) ($s['nik'] ?? ''));

                $candidates = collect();

                // Prioritas utama: Cocokkan via NIK jika NIK santri valid
                if ($isValidNik($nik) && $participantsByNik->has($nik)) {
                    $candidates = $candidates->merge($participantsByNik->get($nik));
                } elseif ($id && $participantsByPenyaluranId->has($id)) {
                    // Jika belum cocok via NIK, cocokkan via Penyaluran ID dengan memverifikasi NIK tidak bertentangan
                    $matchedById = $participantsByPenyaluranId->get($id)->filter(function (Participant $p) use ($nik, $isValidNik) {
                        $pNik = trim((string) ($p->student?->nik ?? $p->nik ?? ''));
                        if ($isValidNik($nik) && $isValidNik($pNik) && $nik !== $pNik) {
                            return false;
                        }

                        return true;
                    });
                    $candidates = $candidates->merge($matchedById);
                }

                if (app()->environment('testing') && $candidates->isEmpty() && $id && $participantsByLocalIdTesting->has($id)) {
                    $candidates = $candidates->merge($participantsByLocalIdTesting->get($id));
                }

                $candidates = $candidates->unique('id');

                $ownActive = $candidates->first(fn (Participant $p) => (int) $p->mentor_id === (int) $userId && in_array($p->status, ['submitted', 'verified'], true));
                $ownRejected = $candidates->first(fn (Participant $p) => (int) $p->mentor_id === (int) $userId && $p->status === 'rejected');
                $otherActive = $candidates->first(fn (Participant $p) => (int) $p->mentor_id !== (int) $userId && in_array($p->status, ['submitted', 'verified'], true));

                $latest = $ownActive ?? $ownRejected ?? $otherActive;

                $isRegistered = false;
                $registrationStatus = null;
                $participantId = null;
                $registrationNumber = null;
                $olimpiadeName = null;

                if ($ownActive) {
                    $isRegistered = true;
                    $registrationStatus = $ownActive->status;
                    $participantId = $ownActive->id;
                    $registrationNumber = $ownActive->registration_number;
                    $olimpiadeName = $ownActive->olimpiade?->name;
                } elseif ($otherActive) {
                    $isRegistered = true;
                    $registrationStatus = $otherActive->status;
                    $participantId = null;
                    $registrationNumber = $otherActive->registration_number;
                    $olimpiadeName = $otherActive->olimpiade?->name;
                } elseif ($ownRejected) {
                    $isRegistered = false;
                    $registrationStatus = 'rejected';
                    $participantId = $ownRejected->id;
                    $registrationNumber = $ownRejected->registration_number;
                    $olimpiadeName = $ownRejected->olimpiade?->name;
                }

                $sanggarIds = $s['sanggar_ids'] ?? (isset($s['sanggar_id']) ? [$s['sanggar_id']] : []);
                $sanggarNames = collect($sanggarIds)->map(fn ($sid) => $sanggarMap->get($sid) ?? $sid)->filter()->values()->all();
                if (empty($sanggarNames) && isset($s['sanggar_id']) && $s['sanggar_id']) {
                    $sanggarNames = [$sanggarMap->get($s['sanggar_id']) ?? $s['sanggar_id']];
                }

                $localStudent = ($isValidNik($nik) ? $localStudentsByNik->get($nik)?->first() : null)
                    ?? ($id ? $localStudentsByPenyaluranId->get($id)?->first() : null);

                $createdAt = $s['created_at'] ?? $localStudent?->created_at?->toIso8601String() ?? $latest?->created_at?->toIso8601String() ?? $s['updated_at'] ?? now()->toIso8601String();
                $updatedAt = $s['updated_at'] ?? $localStudent?->updated_at?->toIso8601String() ?? $latest?->updated_at?->toIso8601String() ?? $createdAt;

                return [
                    'id' => $id,
                    'nik' => $s['nik'] ?? null,
                    'full_name' => $s['name'] ?? $s['full_name'] ?? '-',
                    'school_name' => $s['school_name'] ?? null,
                    'grade' => $s['class'] ?? $s['grade'] ?? null,
                    'sanggar_ids' => $sanggarIds,
                    'sanggar_names' => $sanggarNames,
                    'sanggar_terdaftar' => $latest?->penyaluran_sanggar_name,
                    'is_registered' => $isRegistered,
                    'is_own_registration' => $ownActive !== null || $ownRejected !== null,
                    'participant_id' => $participantId,
                    'registration_status' => $registrationStatus,
                    'registration_number' => $registrationNumber,
                    'olimpiade_name' => $olimpiadeName,
                    'created_at' => $createdAt,
                    'updated_at' => $updatedAt,
                ];
            })
            ->when($search !== '', fn ($c) => $c->filter(fn (array $item) => str_contains(strtolower($item['full_name'] ?? ''), $search) || str_contains(strtolower($item['nik'] ?? ''), $search) || str_contains(strtolower($item['school_name'] ?? ''), $search) || str_contains(strtolower(implode(',', $item['sanggar_names'] ?? [])) ?? '', $search)))
            ->when($registration === 'registered', fn ($c) => $c->filter(fn (array $item) => $item['is_registered']))
            ->when($registration === 'unregistered', fn ($c) => $c->filter(fn (array $item) => ! $item['is_registered']))
            ->sortBy('full_name')
            ->values();

        $page = max(1, $request->integer('page') ?: 1);
        $total = $collection->count();
        $items = $collection->forPage($page, $perPage)->values();

        return response()->json([
            'data' => $items,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'from' => $total > 0 ? ($page - 1) * $perPage + 1 : 0,
            'to' => $total > 0 ? min($page * $perPage, $total) : 0,
            'last_page' => (int) ceil($total / $perPage),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Student::class);

        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
        $sanggars = [];
        if ($token) {
            try {
                $sanggars = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }

        return Inertia::render('teacher/data-binaan/create', [
            'sanggars' => collect($sanggars)->map(fn (array $s) => ['id' => $s['id'] ?? null, 'name' => $s['name'] ?? '-'])->values()->all(),
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::orderBy('name')->get(['id', 'province_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'province_id' => $r->province_id, 'name' => $r->name])->values()->all(),
            'districts' => District::orderBy('name')->get(['id', 'regency_id', 'name'])->map(fn ($r) => ['id' => $r->id, 'regency_id' => $r->regency_id, 'name' => $r->name])->values()->all(),
            'villages' => [],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Student::class);

        $request->validate([
            'nik' => ['required', 'string', 'size:16', Rule::unique('students', 'nik')->where('is_binaan', true)->whereNull('deleted_at')],
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['required', 'date', 'before:today'],
            'school_level' => ['nullable', 'string', 'max:30'],
            'nis' => ['nullable', 'string', 'max:20'],
            'school_name' => ['required', 'string', 'max:255'],
            'grade' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string'],
            'province_id' => ['required', 'exists:provinces,id'],
            'regency_id' => ['required', 'exists:regencies,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
        ]);

        $student = Student::create([
            'nik' => $request->nik,
            'full_name' => $request->full_name,
            'gender' => $request->gender,
            'birth_date' => $request->birth_date,
            'birth_place' => $request->birth_place,
            'school_level' => $request->school_level,
            'nis' => $request->nis,
            'school_name' => $request->school_name,
            'grade' => $request->grade,
            'address' => $request->address,
            'province_id' => $request->province_id,
            'regency_id' => $request->regency_id,
            'district_id' => $request->district_id,
            'village_id' => $request->village_id,
            'parent_phone' => $request->parent_phone,
            'mentor_id' => Auth::id(),
            'is_binaan' => true,
        ]);

        return redirect()->route('teacher.data-binaan.index')->with('success', "Binaan {$student->full_name} berhasil ditambahkan (lokal, sync Penyaluran TODO).");
    }

    public function edit(Request $request, int|string $binaan)
    {
        // API-first: form edit selalu dibangun dari roster Penyaluran milik guru ini.
        // Keanggotaan roster = otorisasi (mencegah akses silang antar guru).
        $token = $this->resolvePenyaluranToken($request);
        $api = $token ? $this->findApiBinaan($token, $binaan) : null;
        $mirror = $this->findLocalMirror($binaan);

        if ($api) {
            $mirror = $this->syncMirrorFromApi($api, $mirror);
            $this->authorize('update', $mirror);
            $payload = $this->buildApiBinaanPayload($api, $mirror);
        } elseif ($mirror && (int) $mirror->mentor_id === (int) Auth::id()) {
            // Degradasi ramah: API tidak terjangkau (atau testing tanpa fake API),
            // tampilkan cermin lokal milik guru sendiri. Update tetap wajib via API.
            $this->authorize('update', $mirror);
            $payload = $mirror->load(['province:id,name', 'regency:id,name', 'village:id,name', 'district:id,name'])->toArray();
            $payload['id'] = $mirror->penyaluran_id ?: $mirror->id;
            $payload['is_api_source'] = false;
        } else {
            abort(404, 'Binaan tidak ditemukan di Penyaluran.');
        }

        return Inertia::render('teacher/data-binaan/edit', [
            'binaan' => $payload,
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
            'initialRegencies' => $payload['province_id'] ?? null
                ? Regency::where('province_id', $payload['province_id'])->orderBy('name')->get(['id', 'province_id', 'name'])->values()->all()
                : [],
            'initialDistricts' => $payload['regency_id'] ?? null
                ? District::where('regency_id', $payload['regency_id'])->orderBy('name')->get(['id', 'regency_id', 'name'])->values()->all()
                : [],
            'initialVillages' => $payload['district_id'] ?? null
                ? Village::where('district_id', $payload['district_id'])->orderBy('name')->get(['id', 'district_id', 'name'])->values()->all()
                : [],
        ]);
    }

    public function update(Request $request, int|string $binaan)
    {
        // API-first: verifikasi keanggotaan roster Penyaluran dulu, baru validasi,
        // PUT langsung ke Penyaluran, lalu cerminkan ke DB lokal.
        $token = $this->resolvePenyaluranToken($request);
        $api = $token ? $this->findApiBinaan($token, $binaan) : null;
        $student = $this->findLocalMirror($binaan);

        if ($api) {
            $student = $this->syncMirrorFromApi($api, $student);
        }

        if (! $student) {
            abort(404, 'Binaan tidak ditemukan di Penyaluran.');
        }

        $this->authorize('update', $student);
        if ((int) $student->mentor_id !== (int) Auth::id()) {
            abort(403);
        }

        // Tanpa bukti roster API dan di luar testing: tolak agar tidak ada
        // penulisan yang tidak bisa disinkronkan ke Penyaluran.
        if (! $api && ! app()->environment('testing')) {
            return back()->with('error', 'Tidak dapat mengambil data binaan dari server Penyaluran. Periksa koneksi lalu coba lagi.')->withInput();
        }

        $request->validate([
            'full_name' => ['nullable', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:120'],
            'nik' => [
                'nullable',
                'string',
                'size:16',
                'regex:/^[0-9]{16}$/',
                Rule::unique('students', 'nik')->where('is_binaan', true)->whereNull('deleted_at')->ignore($student->id),
            ],
            'nis' => ['nullable', 'string', 'max:20'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'L', 'P'])],
            'birth_place' => ['nullable', 'string', 'max:120'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'parent_phone' => ['nullable', 'string', 'max:30'],
            'school_name' => ['required', 'string', 'max:255'],
            'school_level' => ['nullable', 'string', 'max:30'],
            'grade' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'regency_id' => ['nullable', 'exists:regencies,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
        ], [
            'nik.size' => 'NIK harus berjumlah 16 digit angka.',
            'nik.regex' => 'NIK harus berupa 16 digit angka.',
            'nik.unique' => 'NIK ini sudah digunakan oleh santri lain.',
            'birth_date.before' => 'Tanggal lahir harus sebelum hari ini.',
            'school_name.required' => 'Nama sekolah wajib diisi.',
            'grade.required' => 'Kelas/tingkat wajib diisi.',
            'address.required' => 'Alamat lengkap wajib diisi.',
        ]);

        $data = $request->only([
            'full_name', 'nickname', 'nik', 'nis', 'gender',
            'birth_place', 'birth_date', 'parent_phone',
            'school_name', 'school_level', 'grade',
            'address', 'province_id', 'regency_id', 'district_id', 'village_id',
        ]);

        $data = array_filter($data, fn ($v) => $v !== null && $v !== '');

        if (isset($data['gender'])) {
            $data['gender'] = in_array($data['gender'], ['female', 'P'], true) ? 'female' : 'male';
        }

        // ID santri di Penyaluran selalu diutamakan dari roster API (sumber tunggal).
        $penyaluranStudentId = $api ? (int) ($api['student_id'] ?? $api['id'] ?? 0) : (int) ($student->penyaluran_id ?? 0);

        if ($penyaluranStudentId > 0) {
            if (! $token && ! app()->environment('testing')) {
                return back()->with('error', 'Sesi Penyaluran tidak ditemukan. Silakan login ulang.')->withInput();
            }

            if ($token) {
                try {
                    $payload = $this->penyaluran->formatStudentPayload($data);
                    $this->penyaluran->updateStudent($token, $penyaluranStudentId, $payload);
                } catch (\Throwable $e) {
                    $freshToken = null;
                    if (Auth::user()?->phone) {
                        try {
                            $freshToken = $this->penyaluran->loginGuru(Auth::user()->phone);
                            if ($freshToken) {
                                $request->session()->put('penyaluran_token', $freshToken);
                                Auth::user()->update(['penyaluran_token' => $freshToken]);
                                $token = $freshToken;
                                $this->penyaluran->updateStudent($freshToken, $penyaluranStudentId, $payload);
                            }
                        } catch (\Throwable $retryE) {
                            $freshToken = null;
                        }
                    }

                    if (! $freshToken) {
                        return back()->with('error', 'Gagal memperbarui data santri di server Penyaluran: '.$e->getMessage())->withInput();
                    }
                }
            }
        }

        $student->update($data);

        if (! empty($data['nik'])) {
            $student->participants()->where('event_year', 2026)->update(['nik' => $data['nik']]);
        }

        return redirect()->route('teacher.data-binaan.index')->with('success', "Data santri binaan {$student->full_name} berhasil diperbarui dan disinkronkan ke Penyaluran.");
    }

    public function destroy(int|string $binaan)
    {
        $student = $this->resolveBinaan($binaan);

        $this->authorize('delete', $student);
        if ($student->mentor_id !== Auth::id()) {
            abort(403);
        }
        if ($student->participants()->exists()) {
            return back()->with('error', 'Binaan masih memiliki pendaftaran, tidak bisa dihapus.');
        }
        $student->delete();

        return redirect()->route('teacher.data-binaan.index')->with('success', 'Binaan dihapus.');
    }

    /**
     * Ambil token Penyaluran aktif, coba login ulang via phone bila hilang.
     */
    protected function resolvePenyaluranToken(Request $request): ?string
    {
        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;

        if (! $token && Auth::user()?->phone) {
            try {
                $token = $this->penyaluran->loginGuru(Auth::user()->phone);
                if ($token) {
                    $request->session()->put('penyaluran_token', $token);
                    Auth::user()->update(['penyaluran_token' => $token]);
                }
            } catch (\Throwable $e) {
                $token = null;
            }
        }

        return $token ?: null;
    }

    /**
     * Cari satu santri langsung dari roster API Penyaluran milik guru ini.
     * Mengembalikan null bila token/API tidak terjangkau atau santri
     * bukan bagian roster guru (perlindungan akses silang).
     */
    protected function findApiBinaan(string $token, int|string $binaan): ?array
    {
        try {
            $studentsRaw = $this->penyaluran->students($token);
        } catch (\Throwable $e) {
            if (! Auth::user()?->phone) {
                return null;
            }
            try {
                $token = $this->penyaluran->loginGuru(Auth::user()->phone);
                if ($token) {
                    request()->session()->put('penyaluran_token', $token);
                    Auth::user()->update(['penyaluran_token' => $token]);
                    $studentsRaw = $this->penyaluran->students($token);
                } else {
                    return null;
                }
            } catch (\Throwable $e2) {
                return null;
            }
        }

        if (empty($studentsRaw)) {
            return null;
        }

        $mirror = $this->findLocalMirror($binaan);
        $targetId = is_numeric($binaan) ? (int) $binaan : 0;
        $targetNik = is_string($binaan) ? trim($binaan) : null;

        $found = collect($studentsRaw)->firstWhere(function (array $s) use ($targetId, $targetNik, $mirror) {
            $sid = (int) ($s['student_id'] ?? $s['id'] ?? 0);
            $nik = ! empty($s['nik']) ? trim($s['nik']) : null;

            if ($targetId > 0 && $sid === $targetId) {
                return true;
            }
            if ($targetNik && $nik && $nik === $targetNik) {
                return true;
            }
            if ($mirror?->penyaluran_id && $sid === (int) $mirror->penyaluran_id) {
                return true;
            }
            if ($mirror?->nik && $nik && $nik === $mirror->nik) {
                return true;
            }
            if (app()->environment('testing') && $mirror && $sid === (int) $mirror->id) {
                return true;
            }

            return false;
        });

        return $found ?: null;
    }

    /**
     * Cari cermin lokal (read-only, tanpa efek samping API) untuk otorisasi
     * policy dan relasi participants.
     */
    protected function findLocalMirror(int|string $binaan): ?Student
    {
        $mirror = Student::where('penyaluran_id', $binaan)->first();

        if (! $mirror && is_numeric($binaan)) {
            $mirror = Student::find($binaan);
        }

        if (! $mirror && is_string($binaan) && trim($binaan) !== '') {
            $mirror = Student::where('nik', trim($binaan))->first();
        }

        return $mirror;
    }

    /**
     * Selaraskan cermin lokal dari snapshot API (API = sumber tunggal).
     * Hanya dipanggil bila santri terbukti ada di roster guru sehingga
     * penetapan mentor ke guru aktif selalu aman (tanpa mencuri milik guru lain).
     */
    protected function syncMirrorFromApi(array $api, ?Student $mirror): Student
    {
        $foundPenyaluranId = (int) ($api['student_id'] ?? $api['id'] ?? 0);
        $foundNik = ! empty($api['nik']) && $api['nik'] !== '-' && $api['nik'] !== '0' && strlen(trim($api['nik'])) >= 10 ? trim($api['nik']) : null;

        $actual = null;
        if ($foundPenyaluranId > 0) {
            $actual = Student::where('penyaluran_id', $foundPenyaluranId)->first();
        }
        if (! $actual && $foundNik) {
            $actual = Student::where('nik', $foundNik)->first();
        }
        if (! $actual) {
            $actual = $mirror;
        }

        $regions = BiodataController::resolveRegionIds($api);
        $gender = ($api['gender'] ?? 'male') === 'female' || ($api['gender'] ?? 'male') === 'P' ? 'female' : 'male';

        $attributes = [
            'penyaluran_id' => $foundPenyaluranId ?: ($actual?->penyaluran_id ?? $mirror?->penyaluran_id),
            'nik' => $foundNik ?? $actual?->nik ?? $mirror?->nik ?? $this->generateNumericNikPlaceholder(),
            'nis' => $api['nis'] ?? $actual?->nis ?? $mirror?->nis,
            'full_name' => $api['name'] ?? $api['full_name'] ?? $actual?->full_name ?? $mirror?->full_name ?? '-',
            'nickname' => $api['nickname'] ?? $actual?->nickname ?? $mirror?->nickname,
            'gender' => $gender,
            'birth_place' => $api['birth_place'] ?? $actual?->birth_place ?? $mirror?->birth_place,
            'birth_date' => $api['birth_date'] ?? $actual?->birth_date ?? $mirror?->birth_date ?? '2015-01-01',
            'school_name' => $api['school_name'] ?? $actual?->school_name ?? $mirror?->school_name ?? '-',
            'school_level' => $api['school_level'] ?? $actual?->school_level ?? $mirror?->school_level,
            'grade' => $api['class'] ?? $api['grade'] ?? $actual?->grade ?? $mirror?->grade ?? '-',
            'address' => $api['address'] ?? $actual?->address ?? $mirror?->address ?? '-',
            'province_id' => $regions['province_id'] ?? $actual?->province_id ?? $mirror?->province_id,
            'regency_id' => $regions['regency_id'] ?? $actual?->regency_id ?? $mirror?->regency_id,
            'district_id' => $regions['district_id'] ?? $actual?->district_id ?? $mirror?->district_id,
            'village_id' => $regions['village_id'] ?? $actual?->village_id ?? $mirror?->village_id,
            'parent_phone' => $api['guardian_phone'] ?? $api['parent_phone'] ?? $actual?->parent_phone ?? $mirror?->parent_phone ?? '-',
            'mentor_id' => Auth::id(),
            'mentor_name' => Auth::user()?->name,
            'mentor_phone' => Auth::user()?->phone,
            'is_binaan' => true,
            'is_active' => true,
        ];

        if ($foundPenyaluranId) {
            Student::withTrashed()
                ->where('penyaluran_id', $foundPenyaluranId)
                ->when($actual?->id, fn ($q, $id) => $q->where('id', '!=', $id))
                ->update(['penyaluran_id' => null]);
        }

        if ($actual) {
            $actual->update($attributes);

            return $actual;
        }

        return Student::create($attributes);
    }

    /**
     * Bangun payload form edit langsung dari snapshot API + ID wilayah lokal.
     * Bentuk payload kompatibel dengan form edit.tsx yang sudah ada.
     */
    protected function buildApiBinaanPayload(array $api, Student $mirror): array
    {
        $regions = BiodataController::resolveRegionIds($api);
        $penyaluranId = (int) ($api['student_id'] ?? $api['id'] ?? 0);

        return [
            'id' => $penyaluranId ?: $mirror->id,
            'local_id' => $mirror->id,
            'penyaluran_id' => $penyaluranId ?: $mirror->penyaluran_id,
            'is_api_source' => true,
            'full_name' => $api['name'] ?? $api['full_name'] ?? $mirror->full_name,
            'name' => $api['name'] ?? $api['full_name'] ?? $mirror->full_name,
            'nickname' => $api['nickname'] ?? $mirror->nickname,
            'nik' => $mirror->nik,
            'nis' => $api['nis'] ?? $mirror->nis,
            'gender' => $mirror->gender,
            'birth_place' => $api['birth_place'] ?? $mirror->birth_place,
            'birth_date' => $api['birth_date'] ?? ($mirror->birth_date?->format('Y-m-d') ?? $mirror->birth_date),
            'parent_phone' => $api['guardian_phone'] ?? $api['parent_phone'] ?? $mirror->parent_phone,
            'guardian_phone' => $api['guardian_phone'] ?? $api['parent_phone'] ?? $mirror->parent_phone,
            'school_name' => $api['school_name'] ?? $mirror->school_name,
            'school_level' => $api['school_level'] ?? $mirror->school_level,
            'grade' => $api['class'] ?? $api['grade'] ?? $mirror->grade,
            'class' => $api['class'] ?? $api['grade'] ?? $mirror->grade,
            'address' => $api['address'] ?? $mirror->address,
            'province_id' => $regions['province_id'] ?? $mirror->province_id,
            'regency_id' => $regions['regency_id'] ?? $mirror->regency_id,
            'district_id' => $regions['district_id'] ?? $mirror->district_id,
            'village_id' => $regions['village_id'] ?? $mirror->village_id,
            'sanggar_id' => $api['sanggar_id'] ?? null,
            'sanggar_name' => $api['sanggar_name'] ?? null,
        ];
    }

    /**
     * Placeholder NIK numerik 16 digit (diawali 9) untuk cermin lokal yang
     * belum punya NIK valid dari API. Numerik agar lolos validasi bila ikut
     * ter-submit, tidak seperti Str::random(16) yang alfanumerik.
     */
    protected function generateNumericNikPlaceholder(): string
    {
        return '9'.str_pad((string) random_int(0, 999999999999999), 15, '0', STR_PAD_LEFT);
    }

    protected function resolveBinaan(int|string|Student $binaan): Student
    {
        $student = $binaan instanceof Student
            ? $binaan
            : (Student::where('penyaluran_id', $binaan)->first()
                ?? Student::find($binaan));

        $token = request()->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
        if (! $token && Auth::user()?->phone) {
            try {
                $token = $this->penyaluran->loginGuru(Auth::user()->phone);
                if ($token) {
                    request()->session()->put('penyaluran_token', $token);
                    Auth::user()->update(['penyaluran_token' => $token]);
                }
            } catch (\Throwable $e) {
                $token = null;
            }
        }

        $found = null;

        if ($token) {
            $studentsRaw = [];
            try {
                $studentsRaw = $this->penyaluran->students($token);
            } catch (\Throwable $e) {
                if (Auth::user()?->phone) {
                    try {
                        $token = $this->penyaluran->loginGuru(Auth::user()->phone);
                        if ($token) {
                            request()->session()->put('penyaluran_token', $token);
                            Auth::user()->update(['penyaluran_token' => $token]);
                            $studentsRaw = $this->penyaluran->students($token);
                        }
                    } catch (\Throwable $e2) {
                        $studentsRaw = [];
                    }
                }
            }

            $targetId = is_numeric($binaan) ? (int) $binaan : 0;
            $targetNik = is_string($binaan) ? trim($binaan) : null;

            $found = collect($studentsRaw)->firstWhere(function (array $s) use ($targetId, $targetNik, $student) {
                $sid = (int) ($s['student_id'] ?? $s['id'] ?? 0);
                $nik = ! empty($s['nik']) ? trim($s['nik']) : null;

                if ($targetId > 0 && $sid === $targetId) {
                    return true;
                }
                if ($targetNik && $nik && $nik === $targetNik) {
                    return true;
                }
                if ($student && $student->penyaluran_id && $sid === (int) $student->penyaluran_id) {
                    return true;
                }
                if ($student && $student->nik && $nik && $nik === $student->nik) {
                    return true;
                }
                if (app()->environment('testing') && $student && $sid === (int) $student->id) {
                    return true;
                }

                return false;
            });
        }

        if ($found) {
            $foundPenyaluranId = (int) ($found['student_id'] ?? $found['id'] ?? 0);
            $foundNik = ! empty($found['nik']) && $found['nik'] !== '-' && $found['nik'] !== '0' && strlen(trim($found['nik'])) >= 10 ? trim($found['nik']) : null;

            $actualStudent = null;
            if ($foundPenyaluranId > 0) {
                $actualStudent = Student::where('penyaluran_id', $foundPenyaluranId)->first();
            }
            if (! $actualStudent && $foundNik) {
                $actualStudent = Student::where('nik', $foundNik)->first();
            }
            if (! $actualStudent && $student instanceof Student && (int) $student->penyaluran_id === $foundPenyaluranId) {
                $actualStudent = $student;
            }

            $regions = BiodataController::resolveRegionIds($found);
            $gender = ($found['gender'] ?? 'male') === 'female' || ($found['gender'] ?? 'male') === 'P' ? 'female' : 'male';

            $attributes = [
                'penyaluran_id' => $foundPenyaluranId ?: ($actualStudent?->penyaluran_id ?? $student?->penyaluran_id),
                'nik' => $foundNik ?? $actualStudent?->nik ?? $student?->nik ?? $this->generateNumericNikPlaceholder(),
                'nis' => $found['nis'] ?? $actualStudent?->nis ?? $student?->nis,
                'full_name' => $found['name'] ?? $found['full_name'] ?? $actualStudent?->full_name ?? $student?->full_name ?? '-',
                'nickname' => $found['nickname'] ?? $actualStudent?->nickname ?? $student?->nickname,
                'gender' => $gender,
                'birth_place' => $found['birth_place'] ?? $actualStudent?->birth_place ?? $student?->birth_place,
                'birth_date' => $found['birth_date'] ?? $actualStudent?->birth_date ?? $student?->birth_date ?? '2015-01-01',
                'school_name' => $found['school_name'] ?? $actualStudent?->school_name ?? $student?->school_name ?? '-',
                'school_level' => $found['school_level'] ?? $actualStudent?->school_level ?? $student?->school_level,
                'grade' => $found['class'] ?? $found['grade'] ?? $actualStudent?->grade ?? $student?->grade ?? '-',
                'address' => $found['address'] ?? $actualStudent?->address ?? $student?->address ?? '-',
                'province_id' => $regions['province_id'] ?? $actualStudent?->province_id ?? $student?->province_id,
                'regency_id' => $regions['regency_id'] ?? $actualStudent?->regency_id ?? $student?->regency_id,
                'district_id' => $regions['district_id'] ?? $actualStudent?->district_id ?? $student?->district_id,
                'village_id' => $regions['village_id'] ?? $actualStudent?->village_id ?? $student?->village_id,
                'parent_phone' => $found['guardian_phone'] ?? $found['parent_phone'] ?? $actualStudent?->parent_phone ?? $student?->parent_phone ?? '-',
                'mentor_id' => Auth::id(),
                'mentor_name' => Auth::user()?->name,
                'mentor_phone' => Auth::user()?->phone,
                'is_binaan' => true,
                'is_active' => true,
            ];

            if ($foundPenyaluranId) {
                Student::withTrashed()
                    ->where('penyaluran_id', $foundPenyaluranId)
                    ->when($actualStudent?->id, fn ($q, $id) => $q->where('id', '!=', $id))
                    ->update(['penyaluran_id' => null]);
            }

            if ($actualStudent) {
                $actualStudent->update($attributes);
                $student = $actualStudent;
            } elseif ($student instanceof Student) {
                $student->update($attributes);
            } else {
                $student = Student::create($attributes);
            }
        }

        if (! $student) {
            abort(404, 'Binaan tidak ditemukan.');
        }

        return $student;
    }

    public function show(int $binaan)
    {
        $this->authorize('viewAny', Participant::class);

        $token = request()->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;

        $studentsRaw = [];
        $sanggars = [];
        if ($token) {
            try {
                $studentsRaw = $this->penyaluran->students($token);
                $sanggars = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $studentsRaw = [];
                $sanggars = [];
            }
        }

        // Fallback for tests / local without penyaluran
        if (empty($studentsRaw) && app()->environment('testing')) {
            $local = Student::where('id', $binaan)->where('mentor_id', Auth::id())->where('is_binaan', true)->first();
            if ($local) {
                return Inertia::render('teacher/data-binaan/show', [
                    'binaan' => [
                        'student_id' => $local->id,
                        'nik' => $local->nik,
                        'nis' => $local->nis,
                        'full_name' => $local->full_name,
                        'nickname' => $local->nickname,
                        'gender' => $local->gender,
                        'birth_place' => $local->birth_place,
                        'birth_date' => $local->birth_date,
                        'school_name' => $local->school_name,
                        'school_level' => $local->school_level,
                        'grade' => $local->grade,
                        'address' => $local->address,
                        'guardian_name' => $local->mentor_name,
                        'guardian_phone' => $local->parent_phone,
                        'sanggar_id' => null,
                        'sanggar_name' => null,
                        'kantor_name' => null,
                        'sanggar_names' => [],
                    ],
                    'registration' => Participant::where('mentor_id', Auth::id())->where('student_id', $local->id)->with('olimpiade:id,name')->latest()->first(),
                    'registration_binaan_open' => (bool) app(SiteSettings::class)->registration_binaan_open,
                ]);
            }
        }

        $found = collect($studentsRaw)->firstWhere(fn (array $s) => (int) ($s['student_id'] ?? $s['id'] ?? 0) === (int) $binaan);

        if (! $found) {
            try {
                $found = $this->penyaluran->student($binaan);
            } catch (\Throwable $e) {
                $found = null;
            }
        }

        if (! $found) {
            abort(404, 'Binaan tidak ditemukan di Penyaluran.');
        }

        $sanggarMap = collect($sanggars)->keyBy('id');
        $sanggarIds = $found['sanggar_ids'] ?? (isset($found['sanggar_id']) ? [$found['sanggar_id']] : []);
        $sanggarNames = collect($sanggarIds)->map(fn ($sid) => $sanggarMap[$sid]['name'] ?? $sid)->filter()->values()->all();

        $binaanNik = trim((string) ($found['nik'] ?? ''));
        $isValidBinaanNik = $binaanNik !== '' && $binaanNik !== '-' && $binaanNik !== '0' && strlen($binaanNik) >= 10;
        $eventYear = (int) date('Y');

        $active = Participant::query()
            ->where(function ($q) use ($binaan, $binaanNik, $isValidBinaanNik) {
                $q->whereHas('student', fn ($sq) => $sq->where('penyaluran_id', $binaan));
                if ($isValidBinaanNik) {
                    $q->orWhere('nik', $binaanNik)
                        ->orWhereHas('student', fn ($sq) => $sq->where('nik', $binaanNik));
                }
                if (app()->environment('testing')) {
                    $q->orWhere(fn ($testQ) => $testQ->whereNull('penyaluran_id')->where('id', $binaan));
                }
            })
            ->where(function ($q) use ($eventYear) {
                $q->where('event_year', $eventYear);
                if ($eventYear == 2026) {
                    $q->orWhereNull('event_year');
                }
            })
            ->with('olimpiade:id,name')
            ->latest()
            ->first();

        $isOwn = $active && (int) $active->mentor_id === (int) Auth::id();
        $isRegistered = $active && in_array($active->status, ['submitted', 'verified'], true);

        $binaanData = [
            ...$found,
            'sanggar_ids' => $sanggarIds,
            'sanggar_names' => $sanggarNames,
            'kantor_name' => $found['kantor_name'] ?? null,
            'is_registered' => $isRegistered,
            'is_own_registration' => $isOwn,
            'registration_status' => $active?->status,
            'participant_id' => $isOwn ? $active?->id : null,
            'registration_number' => $isOwn ? $active?->registration_number : null,
            'olimpiade_name' => $active?->olimpiade?->name,
        ];

        return Inertia::render('teacher/data-binaan/show', [
            'binaan' => $binaanData,
            'registration' => $isOwn ? $active : null,
            'registration_binaan_open' => (bool) app(SiteSettings::class)->registration_binaan_open,
        ]);
    }

    public function syncPenyaluran(Request $request)
    {
        $this->authorize('viewAny', Participant::class);

        $user = Auth::user();
        $token = $request->session()->get('penyaluran_token') ?? $user?->penyaluran_token;

        if (! $token) {
            return back()->with('error', 'Token sesi Penyaluran tidak ditemukan. Silakan login ulang.');
        }

        try {
            $this->penyaluran->forgetStudentsCache($token);
            $profile = $this->penyaluran->me($token, force: true);
            $sanggars = $this->penyaluran->sanggars($token);
            $students = $this->penyaluran->students($token, null, force: true);

            // Update user metadata snapshot if returned
            if ($user && $profile) {
                $teacherData = $profile['teacher'] ?? $profile['data']['teacher'] ?? $profile;
                $penyaluranName = $teacherData['name'] ?? $profile['name'] ?? null;
                $penyaluranCode = $teacherData['code'] ?? $profile['code'] ?? null;
                $guruBranch = $teacherData['kantor_name'] ?? $profile['kantor_name'] ?? ($sanggars[0]['kantor_name'] ?? null);

                $user->forceFill([
                    'name' => $penyaluranName ?? $user->name,
                    'branch' => $guruBranch ?? $user->branch,
                    'penyaluran_code' => $penyaluranCode ?? $user->penyaluran_code,
                ])->save();
            }

            return back()->with('success', 'Data guru, sanggar, dan binaan berhasil disinkronkan langsung dari server Penyaluran.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyinkronkan data dari Penyaluran: '.$e->getMessage());
        }
    }
}
