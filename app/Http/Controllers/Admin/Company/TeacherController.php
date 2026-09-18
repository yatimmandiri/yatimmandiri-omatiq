<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTeacherRequest;
use App\Http\Requests\Company\UpdateTeacherRequest;
use App\Models\Core\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class TeacherController extends Controller
{
    use LogActivity;

    public function index()
    {
        $this->authorize('viewAny', User::class);

        $user = Auth::user();
        $isCabang = $user?->hasRole('Cabang') ?? false;
        $userBranch = $isCabang ? $user->getBranchName() : null;

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

    public function show(User $teacher)
    {
        $this->authorize('view', $teacher);

        $user = Auth::user();
        if ($user && $user->hasRole('Cabang')) {
            $branch = $user->getBranchName();
            if (filled($branch)) {
                $teacherBranch = $teacher->getBranchName();
                $hasBranchParticipant = $teacher->participants()->where(function ($pq) use ($branch) {
                    $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                })->exists();

                if (! $hasBranchParticipant && filled($teacherBranch) && stripos($teacherBranch, $branch) === false) {
                    abort(403, 'Akses terbatas untuk guru cabang Anda.');
                }
            }
        }

        $teacher->load(['roles']);

        return Inertia::render('admin/company/teachers/show', [
            'user' => $teacher,
        ]);
    }

    public function edit(User $teacher)
    {
        abort(403, 'Data guru diambil langsung dari Penyaluran, tidak bisa diedit.');
    }

    public function update(UpdateTeacherRequest $request, User $teacher)
    {
        abort(403, 'Data guru diambil langsung dari Penyaluran, tidak bisa diedit.');
    }

    public function destroy(User $teacher)
    {
        abort(403, 'Data guru diambil langsung dari Penyaluran, tidak bisa dihapus.');
    }

    public function resetPassword(User $teacher)
    {
        $this->authorize('update', $teacher);

        $teacher->forceFill(['password' => Hash::make('password')])->save();

        $this->logSuccess('reset-teacher-password', "Reset password guru: {$teacher->name}", ['user_id' => $teacher->id]);

        return back()->with('success', "Password guru {$teacher->name} direset ke default 'password'.");
    }

    public function getData(Request $request)
    {
        $this->authorize('data-user', User::class);

        $user = Auth::user();
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

        // Cabang role strict scoping
        if ($user && $user->hasRole('Cabang')) {
            $branch = $user->getBranchName();
            if (filled($branch)) {
                $query->where(function ($q) use ($branch) {
                    $q->where('branch', $branch)
                        ->orWhere('branch', 'like', "%{$branch}%")
                        ->orWhereHas('participants', function ($pq) use ($branch) {
                            $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                        });
                });
            }
        }

        $query->orderBy($orderBy, $direction)->orderBy('id', 'desc');

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);

        return response()->json($data);
    }
}
