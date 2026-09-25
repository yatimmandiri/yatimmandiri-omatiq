<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreStudentRequest;
use App\Http\Requests\Company\UpdateStudentRequest;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Services\PenyaluranService;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    use LogActivity, UploadFiles;

    public function __construct(
        private readonly StudentService $service,
        private readonly PenyaluranService $penyaluran,
    ) {}

    private function resolveBranch(?\App\Models\Core\User $user): ?string
    {
        if (! $user) {
            return null;
        }

        $rawBranch = $user->getBranchName() ?? $user->branch;
        if (filled($rawBranch)) {
            $clean = trim(preg_replace('/^(user\s+)?(kantor\s+)?(layanan\s+)?cabang\s+/i', '', (string) $rawBranch));
            $clean = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', (string) $clean));

            return $clean !== '' ? $clean : null;
        }

        if ($user->hasRole('Cabang')) {
            $clean = trim(preg_replace('/^(user\s+)?(kantor\s+)?(layanan\s+)?cabang\s+/i', '', (string) $user->name));
            $clean = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', (string) $clean));

            return $clean !== '' ? $clean : null;
        }

        return null;
    }

    public function index(): Response
    {
        $this->authorize('viewAny', Student::class);

        $user = Auth::user();
        $userBranch = $this->resolveBranch($user);
        $userKantorId = $user?->kantor_id;

        $mentors = [];
        try {
            $queryParams = [];
            if ($userKantorId) {
                $queryParams['kantor_id'] = $userKantorId;
            }
            $apiTeachers = $this->penyaluran->allTeachers($queryParams);
            if (empty($apiTeachers) && ! empty($queryParams)) {
                $apiTeachers = $this->penyaluran->allTeachers();
            }

            if (! empty($apiTeachers)) {
                $teachersCol = collect($apiTeachers);

                if (filled($userBranch)) {
                    $branchLower = strtolower($userBranch);
                    $teachersCol = $teachersCol->filter(function (array $t) use ($branchLower, $userKantorId) {
                        if ($userKantorId && ! empty($t['kantor_id']) && (int) $t['kantor_id'] === (int) $userKantorId) {
                            return true;
                        }

                        $kantor = strtolower(trim((string) ($t['kantor_name'] ?? $t['branch'] ?? '')));
                        if ($kantor !== '') {
                            $cleanKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $kantor));
                            $cleanKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanKantor));
                            if (str_contains($kantor, $branchLower) || str_contains($branchLower, $cleanKantor)) {
                                return true;
                            }
                        }

                        $sanggars = $t['sanggars'] ?? [];
                        if (is_array($sanggars) && ! empty($sanggars)) {
                            foreach ($sanggars as $s) {
                                if (! is_array($s)) {
                                    continue;
                                }
                                if ($userKantorId && ! empty($s['kantor_id']) && (int) $s['kantor_id'] === (int) $userKantorId) {
                                    return true;
                                }
                                $sKantor = strtolower(trim((string) ($s['kantor_name'] ?? $s['kantor'] ?? $s['cabang'] ?? '')));
                                if ($sKantor !== '') {
                                    $cleanSKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $sKantor));
                                    $cleanSKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanSKantor));
                                    if (str_contains($sKantor, $branchLower) || str_contains($branchLower, $cleanSKantor)) {
                                        return true;
                                    }
                                }
                            }
                        }

                        return false;
                    });
                }

                $mentors = $teachersCol->map(fn (array $t) => [
                    'id' => $t['id'] ?? $t['teacher_id'],
                    'name' => $t['name'] ?? $t['full_name'] ?? '-',
                ])->unique('id')->sortBy('name')->values()->all();
            }
        } catch (\Throwable $e) {
            $mentors = [];
        }

        if (empty($mentors)) {
            $mentors = $this->service->formOptions()['mentors'];
        }

        return Inertia::render('admin/company/students/list', [
            'mentors' => $mentors,
            'userBranch' => $userBranch,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Student::class);

        return Inertia::render('admin/company/students/create', $this->service->formOptions());
    }

    public function store(StoreStudentRequest $request)
    {
        $this->authorize('create', Student::class);

        $student = Student::create($this->service->payloadFromRequest($request));

        $this->logSuccess('create-student', "Created student: {$student->full_name}", [
            'student_id' => $student->id,
            'new_data' => $student->toArray(),
        ]);

        return redirect()->route('admin.companies.students.index')->with('success', "Binaan {$student->full_name} berhasil ditambahkan.");
    }

    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        $user = Auth::user();
        if ($user && $user->hasRole('Cabang')) {
            $branch = $user->getBranchName();
            if (filled($branch)) {
                $hasBranchParticipant = $student->participants()->where(function ($pq) use ($branch) {
                    $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                })->exists();
                $mentorBranch = $student->mentor?->getBranchName();

                if (! $hasBranchParticipant && (! $mentorBranch || stripos($mentorBranch, $branch) === false)) {
                    abort(403, 'Akses terbatas untuk santri binaan cabang Anda.');
                }
            }
        }

        $student->load(['mentor:id,name,email', 'province:id,name', 'regency:id,name']);

        return Inertia::render('admin/company/students/show', [
            'student' => $this->service->showPayload($student),
            'participants' => $student->participants()
                ->with(['olimpiade:id,name,category'])
                ->orderByDesc('created_at')
                ->get(['id', 'olimpiade_id', 'registration_number', 'status', 'payment_status', 'created_at']),
        ]);
    }

    public function edit(Student $student): Response
    {
        $this->authorize('update', $student);

        $student = $this->service->resolveFromPenyaluran($student);

        return Inertia::render('admin/company/students/edit', [
            'student' => $student->load(['mentor:id,name,email,phone', 'province:id,name', 'regency:id,name', 'district:id,name', 'village:id,name']),
            ...$this->service->formOptions($student),
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $this->authorize('update', $student);

        $payload = $this->service->payloadFromRequest($request, $student);

        if ($student->penyaluran_id) {
            try {
                $this->service->syncToPenyaluran($student, $payload);
            } catch (\Throwable $e) {
                return back()
                    ->withErrors(['nik' => 'Gagal memperbarui data santri di server Penyaluran: '.$e->getMessage()])
                    ->withInput();
            }
        }

        $oldData = $student->toArray();
        $student->update($payload);

        if (! empty($payload['nik'])) {
            $student->participants()->where('event_year', 2026)->update(['nik' => $payload['nik']]);
        }

        $this->logSuccess('update-student', "Updated student: {$student->full_name}", [
            'student_id' => $student->id,
            'old_data' => $oldData,
            'new_data' => $student->fresh()->toArray(),
        ]);

        return redirect()->route('admin.companies.students.index')->with('success', "Data binaan {$student->full_name} berhasil diupdate.");
    }

    public function destroy(Student $student)
    {
        $this->authorize('delete', $student);

        if ($student->participants()->exists()) {
            return redirect()->route('admin.companies.students.index')->with('error', "Binaan {$student->full_name} memiliki data peserta dan tidak dapat dihapus.");
        }

        $name = $student->full_name;
        foreach (['photo_path', 'identity_card_path', 'family_card_path'] as $column) {
            $this->deleteFile($student->{$column});
        }

        $student->delete();
        $this->logSuccess('delete-student', "Deleted student: {$name}", ['student_id' => $student->id]);

        return redirect()->route('admin.companies.students.index')->with('success', "Binaan {$name} berhasil dihapus.");
    }

    public function status(Request $request, Student $student)
    {
        $this->authorize('update', $student);

        $newStatus = ! $student->is_active;

        if ($student->penyaluran_id) {
            try {
                $this->service->syncToPenyaluran($student, ['status' => $newStatus]);
            } catch (\Throwable $e) {
                return back()->with('error', 'Gagal memperbarui status santri di Penyaluran: '.$e->getMessage());
            }
        }

        $student->update(['is_active' => $newStatus]);

        $this->logSuccess('update-student-status', "Toggled student status: {$student->full_name} -> ".($student->is_active ? 'aktif' : 'non-aktif'), ['student_id' => $student->id]);

        return back()->with('success', $student->is_active ? 'Data diaktifkan.' : 'Data dinonaktifkan.');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-student', Student::class);

        $user = Auth::user();
        $branch = $this->resolveBranch($user);
        $userKantorId = $user?->kantor_id;

        // Primary source: Penyaluran API api/v1/students (X-API-KEY) — 4202 students
        $apiStudents = [];
        try {
            $queryParams = [];
            if ($userKantorId) {
                $queryParams['kantor_id'] = $userKantorId;
            }
            $apiStudents = $this->penyaluran->allStudents($queryParams);
            if (empty($apiStudents) && ! empty($queryParams)) {
                $apiStudents = $this->penyaluran->allStudents();
            }
        } catch (\Throwable $e) {
            $apiStudents = [];
        }

        // If API available and not filtered to local-only, serve from API with DataTable handling
        $filterValue = $request->input('filterValue', []);
        if (is_string($filterValue)) {
            $filterValue = json_decode($filterValue, true) ?? [];
        }
        $isBinaanFilter = data_get($filterValue, 'is_binaan');
        $useApi = ! empty($apiStudents) && ($isBinaanFilter === null || $isBinaanFilter === '' || $isBinaanFilter === 'all');

        if ($useApi) {
            $search = strtolower($request->string('globalSearch')->toString());
            $collection = collect($apiStudents);

            // Strict Cabang scoping by branch name or kantor_id
            if (filled($branch)) {
                $branchLower = strtolower($branch);
                $collection = $collection->filter(function (array $s) use ($branchLower, $userKantorId) {
                    // 1. Match by kantor_id if both present
                    if ($userKantorId && ! empty($s['kantor_id']) && (int) $s['kantor_id'] === (int) $userKantorId) {
                        return true;
                    }

                    // 2. Match by student's kantor_name / branch
                    $kantor = strtolower(trim((string) ($s['kantor_name'] ?? $s['branch'] ?? '')));
                    if ($kantor !== '') {
                        $cleanKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $kantor));
                        $cleanKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanKantor));
                        if (str_contains($kantor, $branchLower) || str_contains($branchLower, $cleanKantor)) {
                            return true;
                        }
                    }

                    // 3. Match by student's sanggar kantor/branch
                    $sanggarKantor = strtolower(trim((string) ($s['sanggar']['kantor_name'] ?? $s['sanggar']['kantor'] ?? $s['sanggar']['cabang'] ?? '')));
                    if ($sanggarKantor !== '') {
                        $cleanSKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $sanggarKantor));
                        $cleanSKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanSKantor));
                        if (str_contains($sanggarKantor, $branchLower) || str_contains($branchLower, $cleanSKantor)) {
                            return true;
                        }
                    }

                    return false;
                });
            } elseif ($user && $user->hasRole('Teacher')) {
                // Teacher sees only its own binaan via teacher_id or sanggar/teacher match
                $teacherId = $user->teacher_id ?? $user->penyaluran_id;
                $teacherName = strtolower($user->name ?? '');
                $collection = $collection->filter(function (array $s) use ($teacherId, $teacherName) {
                    if ($teacherId && ! empty($s['teacher_id']) && (int) $s['teacher_id'] === (int) $teacherId) {
                        return true;
                    }
                    $tName = strtolower($s['teacher_name'] ?? '');
                    if ($tName !== '' && $teacherName !== '' && str_contains($tName, explode(' ', $teacherName)[0])) {
                        return true;
                    }

                    return false;
                });
                if ($collection->isEmpty()) {
                    $useApi = false;
                }
            }

            if ($useApi) {
                if ($search !== '') {
                    $collection = $collection->filter(function (array $s) use ($search) {
                        $name = strtolower($s['name'] ?? $s['full_name'] ?? '');
                        $nik = strtolower($s['nik'] ?? '');
                        $school = strtolower($s['school_name'] ?? '');
                        $kantor = strtolower($s['kantor_name'] ?? '');
                        $sanggar = strtolower($s['sanggar_name'] ?? '');

                        return str_contains($name, $search) || str_contains($nik, $search) || str_contains($school, $search) || str_contains($kantor, $search) || str_contains($sanggar, $search);
                    });
                }

                $schoolLevel = data_get($filterValue, 'school_level');
                $provinceId = data_get($filterValue, 'province_id');
                $mentorId = data_get($filterValue, 'mentor_id');
                if (filled($schoolLevel) && $schoolLevel !== 'all') {
                    $collection = $collection->filter(fn (array $s) => strtolower($s['school_level'] ?? '') === strtolower($schoolLevel));
                }
                // province filter maps to province_name for API data
                if (filled($provinceId) && $provinceId !== 'all') {
                    $collection = $collection->filter(fn (array $s) => (string) ($s['province_id'] ?? '') === (string) $provinceId || strtolower($s['province_name'] ?? '') === strtolower($provinceId));
                }
                // mentor filter maps to teacher_id or teacher_name
                if (filled($mentorId) && $mentorId !== 'all') {
                    $collection = $collection->filter(function (array $s) use ($mentorId) {
                        if (! empty($s['teacher_id']) && (string) $s['teacher_id'] === (string) $mentorId) {
                            return true;
                        }
                        if (! empty($s['mentor_id']) && (string) $s['mentor_id'] === (string) $mentorId) {
                            return true;
                        }

                        return false;
                    });
                }

                $allowed = ['id', 'full_name', 'name', 'school_name', 'nik', 'created_at'];
                $orderBy = $request->input('orderBy') ?: 'id';
                if (! in_array($orderBy, $allowed, true)) {
                    $orderBy = 'id';
                }
                $sortKey = $orderBy === 'full_name' ? 'name' : $orderBy;
                $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';
                $collection = $collection->sortBy(fn (array $s) => strtolower((string) ($s[$sortKey] ?? '')), SORT_REGULAR, $direction === 'desc')->values();

                $perPage = min($request->integer('perPage') ?: 10, 100);
                $page = max(1, $request->integer('page') ?: 1);
                $total = $collection->count();
                $items = $collection->forPage($page, $perPage)->values();

                $pageStudentIds = $items->pluck('id')->filter()->map(fn ($id) => (int) $id)->all();
                $pageNiks = $items->pluck('nik')->filter(fn ($n) => filled($n) && strlen(trim((string) $n)) >= 10)->values()->all();

                $participantsCountByPenyaluranId = collect();
                $participantsCountByNik = collect();

                if (! empty($pageStudentIds) || ! empty($pageNiks)) {
                    $participantsQuery = Participant::query()
                        ->where(function ($q) use ($pageStudentIds, $pageNiks) {
                            if (! empty($pageStudentIds)) {
                                $q->whereHas('student', fn ($sq) => $sq->whereIn('penyaluran_id', $pageStudentIds));
                            }
                            if (! empty($pageNiks)) {
                                $q->orWhereIn('nik', $pageNiks)
                                    ->orWhereHas('student', fn ($sq) => $sq->whereIn('nik', $pageNiks));
                            }
                        })
                        ->with('student:id,penyaluran_id,nik')
                        ->get(['id', 'student_id', 'nik', 'status']);

                    $participantsCountByPenyaluranId = $participantsQuery
                        ->filter(fn (Participant $p) => filled($p->student?->penyaluran_id))
                        ->groupBy(fn (Participant $p) => (int) $p->student->penyaluran_id)
                        ->map->count();

                    $participantsCountByNik = $participantsQuery
                        ->filter(fn (Participant $p) => filled($p->student?->nik ?? $p->nik))
                        ->groupBy(fn (Participant $p) => (string) ($p->student?->nik ?? $p->nik))
                        ->map->count();
                }

                // Map to Student shape expected by frontend (reuse existing list columns)
                $mapped = $items->map(function (array $s) use ($participantsCountByPenyaluranId, $participantsCountByNik) {
                    $id = (int) ($s['id'] ?? 0);
                    $nik = trim((string) ($s['nik'] ?? ''));

                    $pCount = 0;
                    if ($nik !== '' && $participantsCountByNik->has($nik)) {
                        $pCount = $participantsCountByNik->get($nik);
                    } elseif ($id && $participantsCountByPenyaluranId->has($id)) {
                        $pCount = $participantsCountByPenyaluranId->get($id);
                    }

                    return [
                        'id' => $s['id'],
                        'penyaluran_id' => $s['id'],
                        'full_name' => $s['name'],
                        'nik' => $s['nik'],
                        'school_name' => $s['school_name'],
                        'school_level' => $s['school_level'],
                        'class' => $s['class'] ?? $s['grade'] ?? null,
                        'kantor_name' => $s['kantor_name'],
                        'branch' => $s['kantor_name'],
                        'sanggar_name' => $s['sanggar_name'],
                        'teacher_name' => $s['teacher_name'],
                        'province_name' => $s['province_name'],
                        'is_binaan' => true,
                        'is_active' => $s['status'] ?? true,
                        'mentor' => ['name' => $s['teacher_name'] ?? '-'],
                        'province' => ['name' => $s['province_name'] ?? '-'],
                        'regency' => ['name' => $s['regency_name'] ?? '-'],
                        'participants_count' => $pCount,
                        'created_at' => $s['created_at'] ?? null,
                        'updated_at' => $s['updated_at'] ?? null,
                    ];
                })->values();

                return response()->json([
                    'data' => $mapped,
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'from' => $total > 0 ? ($page - 1) * $perPage + 1 : 0,
                    'to' => $total > 0 ? min($page * $perPage, $total) : 0,
                    'last_page' => (int) ceil($total / $perPage),
                ]);
            }
        }

        // Fallback to local DB
        $allowed = ['id', 'full_name', 'school_name', 'nik', 'is_binaan', 'is_active', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'created_at';
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';

        $query = Student::query()
            ->with(['mentor:id,name', 'province:id,name', 'regency:id,name'])
            ->withCount('participants')
            ->search($request->string('globalSearch')->toString());

        if ($isCabang && filled($branch)) {
            $query->where(function ($q) use ($branch) {
                $q->whereHas('participants', function ($pq) use ($branch) {
                    $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                })->orWhereHas('mentor', function ($mq) use ($branch) {
                    $mq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                });
            });
        } elseif ($user && $user->hasRole('Teacher')) {
            $query->where('mentor_id', $user->id);
        }

        $mentorId = data_get($filterValue, 'mentor_id');
        $isBinaan = data_get($filterValue, 'is_binaan');
        $isActive = data_get($filterValue, 'is_active');
        $schoolLevel = data_get($filterValue, 'school_level');
        $provinceId = data_get($filterValue, 'province_id');

        $query
            ->when(filled($mentorId) && $mentorId !== 'all', fn ($q) => $q->where('mentor_id', $mentorId))
            ->when($isBinaan !== null && $isBinaan !== '' && $isBinaan !== 'all', fn ($q) => $q->where('is_binaan', filter_var($isBinaan, FILTER_VALIDATE_BOOLEAN)))
            ->when($isActive !== null && $isActive !== '' && $isActive !== 'all', fn ($q) => $q->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN)))
            ->when(filled($schoolLevel) && $schoolLevel !== 'all', fn ($q) => $q->where('school_level', $schoolLevel))
            ->when(filled($provinceId) && $provinceId !== 'all', fn ($q) => $q->where('province_id', $provinceId))
            ->orderBy($orderBy, $direction)
            ->orderBy('id', 'desc');

        $perPage = min($request->integer('perPage') ?: 10, 100);

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);

        return response()->json($data);
    }
}
