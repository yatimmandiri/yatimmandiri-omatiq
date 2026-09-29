<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTeacherRequest;
use App\Http\Requests\Company\UpdateTeacherRequest;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class TeacherController extends Controller
{
    use LogActivity;

    public function __construct(private readonly PenyaluranService $penyaluran) {}

    private function resolveBranch(?User $user): ?string
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

    public function index()
    {
        $this->authorize('viewAny', User::class);

        $user = Auth::user();
        $isCabang = $user?->hasRole('Cabang') ?? false;
        $userBranch = $this->resolveBranch($user);

        $branches = [];
        if (! $isCabang && ! $userBranch) {
            $apiTeachers = [];
            try {
                $apiTeachers = $this->penyaluran->allTeachers();
            } catch (\Throwable $e) {
                $apiTeachers = [];
            }

            $branches = collect($apiTeachers)
                ->pluck('kantor_name')
                ->merge(User::whereHas('roles', fn ($q) => $q->where('name', 'Teacher'))->whereNotNull('branch')->pluck('branch'))
                ->filter()
                ->map(fn ($b) => trim((string) $b))
                ->unique()
                ->sort()
                ->values()
                ->map(fn ($name) => [
                    'value' => $name,
                    'label' => $name,
                ]);
        }

        return Inertia::render('admin/company/teachers/list', [
            'userBranch' => $userBranch,
            'filterOptions' => [
                'branches' => $branches,
            ],
        ]);
    }

    public function create()
    {
        abort(403, 'Data guru diambil langsung dari Penyaluran, tidak bisa ditambah manual.');
    }

    public function store(StoreTeacherRequest $request)
    {
        abort(403, 'Data guru diambil langsung dari Penyaluran, tidak bisa ditambah manual.');
    }

    public function show(Request $request, int|string $teacher)
    {
        $this->authorize('viewAny', User::class);

        $user = Auth::user();
        $branch = $this->resolveBranch($user);
        $userKantorId = $user?->kantor_id;

        // 1. Fetch teacher directly from PenyaluranService (single source of truth)
        $found = null;
        try {
            $found = $this->penyaluran->teacher($teacher);
        } catch (\Throwable $e) {
            $found = null;
        }

        // 2. Look up matching local User in DB
        $local = User::query()
            ->with(['roles'])
            ->where(function ($q) use ($teacher, $found) {
                $q->where('id', $teacher)
                    ->orWhere('penyaluran_id', $teacher)
                    ->orWhere('teacher_id', $teacher);

                if ($found) {
                    if (! empty($found['code'])) {
                        $q->orWhere('penyaluran_code', $found['code']);
                    }
                    if (! empty($found['phone'])) {
                        $clean = preg_replace('/\D+/', '', (string) $found['phone']);
                        $q->orWhere('phone', $clean);
                    }
                    if (! empty($found['email']) && filter_var($found['email'], FILTER_VALIDATE_EMAIL)) {
                        $q->orWhere('email', strtolower($found['email']));
                    }
                }
            })
            ->first();

        // 3. If teacher not found from ID directly, but local user has penyaluran_id, fetch from PenyaluranService
        if (! $found && $local && $local->penyaluran_id) {
            try {
                $found = $this->penyaluran->teacher($local->penyaluran_id);
            } catch (\Throwable $e) {
                $found = null;
            }
        }

        // 4. If neither PenyaluranService nor local DB has this teacher, 404
        if (! $found && ! $local) {
            abort(404, 'Data guru tidak ditemukan di Penyaluran maupun sistem.');
        }

        // 5. Build standardized merged teacher data
        $merged = [
            'id' => $found['id'] ?? $local?->penyaluran_id ?? $local?->id ?? $teacher,
            'local_user_id' => $local?->id,
            'penyaluran_id' => $found['penyaluran_id'] ?? $found['id'] ?? $local?->penyaluran_id ?? null,
            'teacher_id' => $found['teacher_id'] ?? $found['id'] ?? $local?->teacher_id ?? null,
            'code' => $found['code'] ?? $found['penyaluran_code'] ?? $local?->penyaluran_code ?? null,
            'penyaluran_code' => $found['code'] ?? $found['penyaluran_code'] ?? $local?->penyaluran_code ?? null,
            'name' => $found['name'] ?? $local?->name ?? 'Guru',
            'email' => (! empty($local?->email) && ! str_ends_with($local->email, '@penyaluran.local')) ? $local->email : ($found['email'] ?? $local?->email ?? '-'),
            'phone' => $found['phone'] ?: ($local?->phone ?? null),
            'kantor_id' => $found['kantor_id'] ?? $local?->kantor_id ?? null,
            'kantor_name' => $found['kantor_name'] ?? $found['branch'] ?? $local?->branch ?? '-',
            'branch' => $found['branch'] ?? $found['kantor_name'] ?? $local?->branch ?? '-',
            'roles' => $local ? $local->roles->pluck('name')->toArray() : ['Teacher'],
            'email_verified_at' => $local?->email_verified_at ?? $found['email_verified_at'] ?? null,
            'teacher_profile_completed_at' => $local?->teacher_profile_completed_at,
            'created_at' => $local?->created_at ?? $found['created_at'] ?? null,
            'updated_at' => $local?->updated_at ?? null,
            'status' => $found['status'] ?? true,
            'sanggars' => $found['sanggars'] ?? [],
            'positions' => $found['positions'] ?? [],
            'nik' => $found['nik'] ?? null,
            'gender' => $found['gender'] ?? null,
            'address' => $found['address'] ?? null,
        ];

        // 6. Cabang branch scoping check
        if (filled($branch)) {
            $branchLower = strtolower($branch);
            $teacherKantor = strtolower(trim((string) ($merged['kantor_name'] ?? $merged['branch'] ?? '')));
            $matchesBranch = false;

            if ($userKantorId && ! empty($merged['kantor_id']) && (int) $merged['kantor_id'] === (int) $userKantorId) {
                $matchesBranch = true;
            } elseif ($teacherKantor !== '') {
                $cleanTeacherKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $teacherKantor));
                if (str_contains($teacherKantor, $branchLower) || str_contains($branchLower, $cleanTeacherKantor)) {
                    $matchesBranch = true;
                }
            }

            if (! $matchesBranch && ! empty($merged['sanggars'])) {
                foreach ($merged['sanggars'] as $s) {
                    if (! is_array($s)) {
                        continue;
                    }
                    if ($userKantorId && ! empty($s['kantor_id']) && (int) $s['kantor_id'] === (int) $userKantorId) {
                        $matchesBranch = true;
                        break;
                    }
                    $sKantor = strtolower(trim((string) ($s['kantor_name'] ?? $s['kantor'] ?? $s['cabang'] ?? '')));
                    if ($sKantor !== '') {
                        $cleanSKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $sKantor));
                        if (str_contains($sKantor, $branchLower) || str_contains($branchLower, $cleanSKantor)) {
                            $matchesBranch = true;
                            break;
                        }
                    }
                }
            }

            if (! $matchesBranch && $user->hasRole('Cabang')) {
                abort(403, 'Akses terbatas untuk guru cabang Anda.');
            }
        }

        // 7. Load participant & student statistics for this teacher if local user exists
        $participantsCount = 0;
        $studentsCount = 0;
        if ($local) {
            $participantsCount = Participant::where('mentor_id', $local->id)->count();
            $studentsCount = Student::where('mentor_id', $local->id)->count();
        }

        return Inertia::render('admin/company/teachers/show', [
            'teacher' => $merged,
            'user' => $merged,
            'apiTeacher' => $found ?? $merged,
            'stats' => [
                'participants_count' => $participantsCount,
                'students_count' => $studentsCount,
                'sanggars_count' => count($merged['sanggars']),
            ],
        ]);
    }

    public function edit(int|string $teacher)
    {
        abort(403, 'Data guru diambil langsung dari Penyaluran, tidak bisa diedit.');
    }

    public function update(UpdateTeacherRequest $request, int|string $teacher)
    {
        abort(403, 'Data guru diambil langsung dari Penyaluran, tidak bisa diedit.');
    }

    public function destroy(int|string $teacher)
    {
        abort(403, 'Data guru diambil langsung dari Penyaluran, tidak bisa dihapus.');
    }

    public function resetPassword(Request $request, int|string $teacher)
    {
        // 1. Resolve local user by penyaluran_id or primary id
        $teacherUser = User::query()
            ->where(function ($q) use ($teacher) {
                $q->where('penyaluran_id', $teacher)
                    ->orWhere('id', $teacher);
            })
            ->whereHas('roles', fn ($q) => $q->where('name', 'Teacher'))
            ->first();

        // 2. If not found in local DB yet, resolve from Penyaluran API to create record
        if (! $teacherUser) {
            $foundApi = null;
            try {
                $foundApi = $this->penyaluran->teacher($teacher);
            } catch (\Throwable $e) {
                $foundApi = null;
            }

            if ($foundApi) {
                $phone = preg_replace('/\D+/', '', (string) ($foundApi['phone'] ?? ''));
                $code = $foundApi['code'] ?? null;
                $email = $foundApi['email'] ?? null;

                $teacherUser = User::query()
                    ->where(function ($q) use ($teacher, $code, $phone, $email) {
                        $q->where('penyaluran_id', $teacher);
                        if ($code) {
                            $q->orWhere('penyaluran_code', $code);
                        }
                        if ($phone) {
                            $q->orWhere('phone', $phone)
                                ->orWhere('phone', '0'.ltrim($phone, '0'))
                                ->orWhere('phone', '62'.ltrim($phone, '0'));
                        }
                        if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                            $q->orWhere('email', strtolower($email));
                        }
                    })
                    ->whereHas('roles', fn ($q) => $q->where('name', 'Teacher'))
                    ->first();

                if (! $teacherUser) {
                    $initialEmail = (! empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL) && ! User::where('email', strtolower($email))->exists())
                        ? strtolower($email)
                        : "guru{$teacher}@penyaluran.local";

                    $teacherUser = User::create([
                        'name' => $foundApi['name'] ?? 'Guru '.$teacher,
                        'email' => $initialEmail,
                        'phone' => $phone ?: null,
                        'branch' => $foundApi['kantor_name'] ?? null,
                        'kantor_id' => $foundApi['kantor_id'] ?? null,
                        'penyaluran_id' => (int) $teacher,
                        'penyaluran_code' => $code,
                        'password' => Hash::make('password'),
                        'email_verified_at' => now(),
                    ]);
                    $teacherUser->assignRole('Teacher');
                }
            }
        }

        if (! $teacherUser) {
            return back()->withErrors(['error' => 'Data user guru tidak ditemukan di sistem.']);
        }

        $this->authorize('update', $teacherUser);

        // Branch check for Cabang role
        $authUser = Auth::user();
        if ($authUser && $authUser->hasRole('Cabang')) {
            $branch = $this->resolveBranch($authUser);
            if (filled($branch)) {
                $branchLower = strtolower($branch);
                $teacherBranch = strtolower(trim((string) ($teacherUser->branch ?? '')));
                if (! str_contains($teacherBranch, $branchLower) && ! str_contains($branchLower, $teacherBranch)) {
                    abort(403, 'Akses terbatas untuk guru cabang Anda.');
                }
            }
        }

        $teacherUser->forceFill([
            'password' => Hash::make('password'),
        ])->save();

        $this->logSuccess('reset-teacher-password', "Reset password guru: {$teacherUser->name}", [
            'user_id' => $teacherUser->id,
            'penyaluran_id' => $teacherUser->penyaluran_id,
        ]);

        return back()->with('success', "Password guru {$teacherUser->name} berhasil direset ke default 'password'.");
    }

    public function getData(Request $request)
    {
        $this->authorize('data-user', User::class);

        $user = Auth::user();
        $branch = $this->resolveBranch($user);
        $userKantorId = $user?->kantor_id;

        $filterValue = $request->input('filterValue', []);
        if (is_string($filterValue)) {
            $filterValue = json_decode($filterValue, true) ?? [];
        }
        $branchFilter = data_get($filterValue, 'branch');

        // Primary source: Penyaluran API api/v1/teachers (X-API-KEY)
        $apiTeachers = [];
        try {
            $queryParams = [];
            if ($userKantorId) {
                $queryParams['kantor_id'] = $userKantorId;
            }
            $apiTeachers = $this->penyaluran->allTeachers($queryParams);
            if (empty($apiTeachers) && ! empty($queryParams)) {
                $apiTeachers = $this->penyaluran->allTeachers();
            }
        } catch (\Throwable $e) {
            $apiTeachers = [];
        }

        // If API returned data, serve from API with local search/pagination (DataTable expects server-side)
        if (! empty($apiTeachers)) {
            $search = strtolower($request->string('globalSearch')->toString());
            $collection = collect($apiTeachers);

            // Strict Cabang scoping by branch name or kantor_id
            if (filled($branch)) {
                $branchLower = strtolower($branch);
                $collection = $collection->filter(function (array $t) use ($branchLower, $userKantorId) {
                    // 1. Match by kantor_id if both present
                    if ($userKantorId && ! empty($t['kantor_id']) && (int) $t['kantor_id'] === (int) $userKantorId) {
                        return true;
                    }

                    // 2. Match by teacher's kantor_name / branch
                    $kantor = strtolower(trim((string) ($t['kantor_name'] ?? $t['branch'] ?? '')));
                    if ($kantor !== '') {
                        $cleanKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $kantor));
                        $cleanKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanKantor));
                        if (str_contains($kantor, $branchLower) || str_contains($branchLower, $cleanKantor)) {
                            return true;
                        }
                    }

                    // 3. Match by teacher's sanggars' kantor/branch
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

            // Filter by selected branch from UI
            if (filled($branchFilter) && $branchFilter !== 'all') {
                $branchFilterLower = strtolower(trim((string) $branchFilter));
                $collection = $collection->filter(function (array $t) use ($branchFilterLower) {
                    $kantor = strtolower(trim((string) ($t['kantor_name'] ?? $t['branch'] ?? '')));
                    if ($kantor !== '') {
                        $cleanKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $kantor));
                        $cleanKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanKantor));
                        if (str_contains($kantor, $branchFilterLower) || str_contains($branchFilterLower, $cleanKantor)) {
                            return true;
                        }
                    }

                    $sanggars = $t['sanggars'] ?? [];
                    if (is_array($sanggars) && ! empty($sanggars)) {
                        foreach ($sanggars as $s) {
                            if (! is_array($s)) {
                                continue;
                            }
                            $sKantor = strtolower(trim((string) ($s['kantor_name'] ?? $s['kantor'] ?? $s['cabang'] ?? '')));
                            if ($sKantor !== '') {
                                $cleanSKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $sKantor));
                                $cleanSKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanSKantor));
                                if (str_contains($sKantor, $branchFilterLower) || str_contains($branchFilterLower, $cleanSKantor)) {
                                    return true;
                                }
                            }
                        }
                    }

                    return false;
                });
            }

            if ($search !== '') {
                $collection = $collection->filter(function (array $t) use ($search) {
                    $name = strtolower($t['name'] ?? '');
                    $email = strtolower($t['email'] ?? '');
                    $phone = strtolower($t['phone'] ?? '');
                    $kantor = strtolower($t['kantor_name'] ?? $t['branch'] ?? '');
                    $code = strtolower($t['code'] ?? $t['penyaluran_code'] ?? '');

                    return str_contains($name, $search) || str_contains($email, $search) || str_contains($phone, $search) || str_contains($kantor, $search) || str_contains($code, $search);
                });
            }

            // Sorting (allow id, name, email, branch/kantor_name, created_at)
            $orderBy = $request->input('orderBy') ?: 'id';
            $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';
            $allowed = ['id', 'name', 'email', 'phone', 'kantor_name', 'branch', 'created_at'];
            if (! in_array($orderBy, $allowed, true)) {
                $orderBy = 'id';
            }
            $sortKey = $orderBy === 'branch' ? 'kantor_name' : $orderBy;
            $collection = $collection->sortBy(fn (array $t) => strtolower((string) ($t[$sortKey] ?? '')), SORT_REGULAR, $direction === 'desc')->values();

            $perPage = min($request->integer('perPage') ?: 10, 100);
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

        // Fallback to local DB if API unavailable
        $allowed = ['id', 'name', 'email', 'branch', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'id';
        if ($request->input('orderBy') === 'kantor_name') {
            $orderBy = 'branch';
        }
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';
        $perPage = min($request->integer('perPage') ?: 10, 100);

        $query = User::query()
            ->with(['roles'])
            ->whereHas('roles', fn ($q) => $q->where('name', 'Teacher'))
            ->search($request->string('globalSearch')->toString());

        if (filled($branch)) {
            $query->where(function ($q) use ($branch) {
                $q->where('branch', $branch)
                    ->orWhere('branch', 'like', "%{$branch}%")
                    ->orWhereHas('participants', function ($pq) use ($branch) {
                        $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                    });
            });
        }

        if (filled($branchFilter) && $branchFilter !== 'all') {
            $query->where(function ($q) use ($branchFilter) {
                $q->where('branch', $branchFilter)
                    ->orWhere('branch', 'like', "%{$branchFilter}%")
                    ->orWhereHas('participants', function ($pq) use ($branchFilter) {
                        $pq->where('branch', $branchFilter)->orWhere('branch', 'like', "%{$branchFilter}%");
                    });
            });
        }

        $query->orderBy($orderBy, $direction)->orderBy('id', 'desc');

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);

        return response()->json($data);
    }
}
