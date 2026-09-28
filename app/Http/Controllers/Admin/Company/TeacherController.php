<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTeacherRequest;
use App\Http\Requests\Company\UpdateTeacherRequest;
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
        $userBranch = $this->resolveBranch($user);

        return Inertia::render('admin/company/teachers/list', [
            'userBranch' => $userBranch,
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

        // Try API first: api/v1/teachers (X-API-KEY)
        $apiTeachers = [];
        try {
            $apiTeachers = $this->penyaluran->allTeachers();
        } catch (\Throwable $e) {
            $apiTeachers = [];
        }

        $found = collect($apiTeachers)->firstWhere(fn (array $t) => (int) ($t['id'] ?? 0) === (int) $teacher);

        // Always resolve local DB user (by penyaluran_id or local primary id)
        $local = User::query()
            ->where(function ($q) use ($teacher, $found) {
                $q->where('penyaluran_id', $teacher)
                    ->orWhere('id', $teacher);
                if ($found && ! empty($found['code'])) {
                    $q->orWhere('penyaluran_code', $found['code']);
                }
                if ($found && ! empty($found['phone'])) {
                    $cleanPhone = preg_replace('/\D+/', '', (string) $found['phone']);
                    if ($cleanPhone) {
                        $q->orWhere('phone', $cleanPhone);
                    }
                }
            })
            ->whereHas('roles', fn ($q) => $q->where('name', 'Teacher'))
            ->first();

        if (! $found && $local) {
            $local->load(['roles']);
            $found = [
                'id' => $local->penyaluran_id ?: $local->id,
                'penyaluran_id' => $local->penyaluran_id,
                'teacher_id' => $local->teacher_id,
                'kantor_id' => $local->kantor_id,
                'name' => $local->name,
                'email' => $local->email,
                'phone' => $local->phone,
                'branch' => $local->branch,
                'kantor_name' => $local->branch,
                'local' => true,
            ];
        }

        if (! $found && ! $local) {
            abort(404);
        }

        // Cabang branch check
        if (filled($branch)) {
            $branchLower = strtolower($branch);
            $teacherKantor = strtolower(trim((string) ($found['kantor_name'] ?? $found['branch'] ?? '')));
            $matchesBranch = false;

            if ($userKantorId && ! empty($found['kantor_id']) && (int) $found['kantor_id'] === (int) $userKantorId) {
                $matchesBranch = true;
            } elseif ($teacherKantor !== '') {
                $cleanTeacherKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $teacherKantor));
                if (str_contains($teacherKantor, $branchLower) || str_contains($branchLower, $cleanTeacherKantor)) {
                    $matchesBranch = true;
                }
            }

            if (! $matchesBranch && ! empty($found['sanggars'])) {
                foreach ($found['sanggars'] as $s) {
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

        if ($local) {
            $local->load(['roles']);

            return Inertia::render('admin/company/teachers/show', [
                'user' => [
                    ...($found ?? []),
                    ...$local->toArray(),
                    'id' => $found['id'] ?? $local->penyaluran_id ?? $local->id,
                    'penyaluran_id' => $local->penyaluran_id ?? ($found['id'] ?? null),
                    'local_id' => $local->id,
                ],
                'apiTeacher' => $found,
            ]);
        }

        return Inertia::render('admin/company/teachers/show', [
            'user' => $found,
            'apiTeacher' => $found,
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

        // 2. Fallback: match via Penyaluran API by code, phone, or email
        if (! $teacherUser) {
            try {
                $apiTeachers = $this->penyaluran->allTeachers();
                $foundApi = collect($apiTeachers)->firstWhere(fn (array $t) => (int) ($t['id'] ?? 0) === (int) $teacher);
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
                            'penyaluran_id' => (int) $teacher,
                            'penyaluran_code' => $code,
                            'password' => Hash::make('password'),
                            'email_verified_at' => now(),
                        ]);
                        $teacherUser->assignRole('Teacher');
                    }
                }
            } catch (\Throwable $e) {
                // Continue with local resolution
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

        $query->orderBy($orderBy, $direction)->orderBy('id', 'desc');

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);

        return response()->json($data);
    }
}
