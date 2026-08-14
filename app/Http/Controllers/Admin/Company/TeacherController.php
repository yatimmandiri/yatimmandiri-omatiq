<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTeacherRequest;
use App\Http\Requests\Company\UpdateTeacherRequest;
use App\Models\Core\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class TeacherController extends Controller
{
    use LogActivity;

    public function index()
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('admin/company/teachers/list');
    }

    public function create()
    {
        $this->authorize('create', User::class);

        return Inertia::render('admin/company/teachers/create');
    }

    public function store(StoreTeacherRequest $request)
    {
        $this->authorize('create', User::class);

        $teacher = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $teacher->assignRole('Teacher');

        $this->logSuccess('create-teacher', "Created Teacher: {$teacher->name}", [
            'user_id' => $teacher->id,
            'new_data' => $teacher->toArray(),
        ]);

        return redirect()->route('admin.companies.teachers.index')->with('success', "Guru {$teacher->name} berhasil ditambahkan.");
    }

    public function show(User $teacher)
    {
        $this->authorize('view', $teacher);

        $teacher->load(['roles']);

        return Inertia::render('admin/company/teachers/show', [
            'user' => $teacher,
        ]);
    }

    public function edit(User $teacher)
    {
        $this->authorize('update', $teacher);

        $teacher->load(['roles']);

        return Inertia::render('admin/company/teachers/edit', [
            'user' => $teacher,
        ]);
    }

    public function update(UpdateTeacherRequest $request, User $teacher)
    {
        $this->authorize('update', $teacher);

        $oldData = $teacher->replicate();

        $teacher->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->password) {
            $teacher->update([
                'password' => Hash::make($request->password),
            ]);
        }

        $this->logSuccess('update-teacher', "Update Teacher: {$teacher->name}", [
            'user_id' => $teacher->id,
            'old_data' => $oldData->toArray(),
            'new_data' => $teacher->toArray(),
        ]);

        return redirect()->route('admin.companies.teachers.index')->with('success', "Guru {$teacher->name} berhasil diupdate.");
    }

    public function destroy(User $teacher)
    {
        $this->authorize('delete', $teacher);

        $name = $teacher->name;
        $teacher->delete();

        $this->logSuccess('delete-teacher', "Delete Teacher: {$name}", ['user_id' => $teacher->id]);

        return redirect()->route('admin.companies.teachers.index')->with('success', "Guru {$name} berhasil dihapus.");
    }

    public function getData(Request $request)
    {
        $this->authorize('data-user', User::class);

        $perPage = $request->input('perPage', 10);
        $page = $request->input('page', 1);
        $globalSearch = $request->input('globalSearch', '');
        $orderDirection = $request->input('orderDirection', 'desc');
        $orderBy = $request->input('orderBy', 'id');

        $query = User::query()
            ->with(['roles'])
            ->whereHas('roles', fn ($q) => $q->where('name', 'Teacher'))
            ->search($globalSearch)
            ->orderBy($orderBy, $orderDirection);

        $data = $perPage
            ? $query->paginate($perPage, ['*'], 'page', $page)
            : $query->get();

        return response()->json($data);
    }
}
