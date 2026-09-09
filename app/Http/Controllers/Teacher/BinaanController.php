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
use Illuminate\Support\Str;
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
                $sanggarsTmp = $this->penyaluran->sanggars($token);
                $sanggarMap = collect($sanggarsTmp)->pluck('name', 'id');
            } catch (\Throwable $e) {
                $studentsRaw = [];
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

        $activeMap = Participant::query()
            ->where('mentor_id', Auth::id())
            ->whereNotNull('student_id')
            ->with(['olimpiade:id,name', 'student:id,penyaluran_id'])
            ->orderByDesc('created_at')
            ->get()
            ->groupBy(fn (Participant $p) => (int) ($p->student?->penyaluran_id ?? $p->student_id))
            ->map(fn ($group) => $group->first());

        $collection = collect($studentsRaw)
            ->unique(fn (array $s) => $s['nik'] ?? $s['student_id'] ?? $s['id'] ?? null)
            ->map(function (array $s) use ($activeMap, $sanggarMap) {
                $id = (int) ($s['student_id'] ?? $s['id'] ?? 0);
                $latest = $activeMap->get($id);
                $sanggarIds = $s['sanggar_ids'] ?? (isset($s['sanggar_id']) ? [$s['sanggar_id']] : []);
                $sanggarNames = collect($sanggarIds)->map(fn ($sid) => $sanggarMap[$sid] ?? $sid)->filter()->values()->all();
                if (empty($sanggarNames) && isset($s['sanggar_id']) && $s['sanggar_id']) {
                    $sanggarNames = [$sanggarMap[$s['sanggar_id']] ?? $s['sanggar_id']];
                }

                return [
                    'id' => $id,
                    'nik' => $s['nik'] ?? null,
                    'full_name' => $s['name'] ?? $s['full_name'] ?? '-',
                    'school_name' => $s['school_name'] ?? null,
                    'grade' => $s['class'] ?? $s['grade'] ?? null,
                    'sanggar_ids' => $sanggarIds,
                    'sanggar_names' => $sanggarNames,
                    'sanggar_terdaftar' => $latest?->penyaluran_sanggar_name,
                    'is_registered' => $latest !== null && in_array($latest->status, ['submitted', 'verified'], true),
                    'participant_id' => $latest?->id,
                    'registration_status' => $latest?->status,
                    'registration_number' => $latest?->registration_number,
                    'olimpiade_name' => $latest?->olimpiade?->name,
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
            'nik' => ['required', 'string', 'size:16', 'unique:students,nik'],
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

    public function edit(int|string $binaan)
    {
        $student = $this->resolveBinaan($binaan);

        $this->authorize('update', $student);
        if ($student->mentor_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('teacher/data-binaan/edit', [
            'binaan' => $student->load(['province:id,name', 'regency:id,name', 'village:id,name', 'district:id,name']),
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
            'initialRegencies' => $student->province_id
                ? Regency::where('province_id', $student->province_id)->orderBy('name')->get(['id', 'province_id', 'name'])->values()->all()
                : [],
            'initialDistricts' => $student->regency_id
                ? District::where('regency_id', $student->regency_id)->orderBy('name')->get(['id', 'regency_id', 'name'])->values()->all()
                : [],
            'initialVillages' => $student->district_id
                ? Village::where('district_id', $student->district_id)->orderBy('name')->get(['id', 'district_id', 'name'])->values()->all()
                : [],
        ]);
    }

    public function update(Request $request, int|string $binaan)
    {
        $student = $this->resolveBinaan($binaan);

        $this->authorize('update', $student);
        if ($student->mentor_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['required', 'date', 'before:today'],
            'birth_place' => ['nullable', 'string', 'max:120'],
            'school_level' => ['nullable', 'string', 'max:30'],
            'nis' => ['nullable', 'string', 'max:20'],
            'school_name' => ['required', 'string', 'max:255'],
            'grade' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'regency_id' => ['nullable', 'exists:regencies,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
            'parent_phone' => ['nullable', 'string', 'max:30'],
        ]);

        $data = $request->only(['full_name', 'gender', 'birth_date', 'school_name', 'grade', 'address', 'province_id', 'regency_id', 'district_id', 'village_id', 'birth_place', 'parent_phone', 'nickname', 'school_level', 'nis']);

        if ($student->penyaluran_id) {
            $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
            if (! $token && ! app()->environment('testing')) {
                return back()->withErrors(['full_name' => 'Sesi Penyaluran tidak ditemukan. Silakan login ulang.'])->withInput();
            }

            if ($token) {
                try {
                    $payload = $this->penyaluran->formatStudentPayload($data);
                    $this->penyaluran->updateStudent($token, $student->penyaluran_id, $payload);
                } catch (\Throwable $e) {
                    return back()->withErrors(['full_name' => 'Gagal memperbarui data santri di server Penyaluran: '.$e->getMessage()])->withInput();
                }
            }
        }

        $student->update($data);

        return redirect()->route('teacher.data-binaan.index')->with('success', "Binaan {$student->full_name} diperbarui.");
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

    protected function resolveBinaan(int|string|Student $binaan): Student
    {
        if ($binaan instanceof Student) {
            return $binaan;
        }

        $student = Student::where('id', $binaan)
            ->orWhere('penyaluran_id', $binaan)
            ->first();

        if (! $student) {
            $token = request()->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
            if ($token) {
                try {
                    $studentsRaw = $this->penyaluran->students($token);
                    $found = collect($studentsRaw)->firstWhere(fn (array $s) => (int) ($s['student_id'] ?? $s['id'] ?? 0) === (int) $binaan);
                    if ($found) {
                        $regions = BiodataController::resolveRegionIds($found);
                        $student = Student::create([
                            'penyaluran_id' => $found['student_id'] ?? $found['id'],
                            'nik' => $found['nik'] ?? Str::random(16),
                            'nis' => $found['nis'] ?? null,
                            'full_name' => $found['name'] ?? $found['full_name'] ?? '-',
                            'nickname' => $found['nickname'] ?? null,
                            'gender' => ($found['gender'] ?? 'male') === 'female' ? 'female' : 'male',
                            'birth_place' => $found['birth_place'] ?? null,
                            'birth_date' => $found['birth_date'] ?? '2015-01-01',
                            'school_name' => $found['school_name'] ?? '-',
                            'school_level' => $found['school_level'] ?? null,
                            'grade' => $found['class'] ?? $found['grade'] ?? '-',
                            'address' => $found['address'] ?? '-',
                            'province_id' => $regions['province_id'],
                            'regency_id' => $regions['regency_id'],
                            'district_id' => $regions['district_id'],
                            'village_id' => $regions['village_id'],
                            'parent_phone' => $found['guardian_phone'] ?? $found['parent_phone'] ?? '-',
                            'mentor_id' => Auth::id(),
                            'mentor_name' => Auth::user()?->name,
                            'mentor_phone' => Auth::user()?->phone,
                            'is_binaan' => true,
                            'is_active' => true,
                        ]);
                    }
                } catch (\Throwable $e) {
                }
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
            abort(404, 'Binaan tidak ditemukan di Penyaluran.');
        }

        $sanggarMap = collect($sanggars)->keyBy('id');
        $sanggarIds = $found['sanggar_ids'] ?? (isset($found['sanggar_id']) ? [$found['sanggar_id']] : []);
        $sanggarNames = collect($sanggarIds)->map(fn ($sid) => $sanggarMap[$sid]['name'] ?? $sid)->filter()->values()->all();

        $active = Participant::query()
            ->where('mentor_id', Auth::id())
            ->whereHas('student', fn ($q) => $q->where('penyaluran_id', $binaan)->orWhere('id', $binaan))
            ->with('olimpiade:id,name')
            ->latest()
            ->first();

        $binaanData = [
            ...$found,
            'sanggar_ids' => $sanggarIds,
            'sanggar_names' => $sanggarNames,
            'kantor_name' => $found['kantor_name'] ?? null,
            'is_registered' => $active && in_array($active->status, ['submitted', 'verified'], true),
            'registration_status' => $active?->status,
            'participant_id' => $active?->id,
            'olimpiade_name' => $active?->olimpiade?->name,
        ];

        return Inertia::render('teacher/data-binaan/show', [
            'binaan' => $binaanData,
            'registration' => $active,
            'registration_binaan_open' => (bool) app(SiteSettings::class)->registration_binaan_open,
        ]);
    }
}
