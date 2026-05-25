<?php

namespace App\Http\Controllers\Admin\Core;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Core\StoreRoleRequest;
use App\Http\Requests\Core\UpdateRoleRequest;
use App\Models\Core\Permission;
use App\Models\Core\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    use LogActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Role::class);

        $data = [];

        return Inertia::render('admin/core/roles/list', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Role::class);

        $permissions = Permission::with(['roles'])->select(['id', 'name'])->get();

        $data = [
            'permissions' => $permissions
        ];

        return Inertia::render('admin/core/roles/create', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request)
    {
        $this->authorize('create', Role::class);

        $role = Role::create([
            'name' => $request->name,
        ]);

        $role->permissions()->sync($request->permissions);

        if ($role) {
            $this->logSuccess('create-role', "Created Role: {$role->name}", [
                'role_id' => $role->id,
                'new_data' => $role->toArray(),
            ]);
        } else {
            $this->logError('create-role', "Failed to create role: {$role->name}", [
                'role_id' => $role->id,
                'new_data' => $role->toArray(),
            ]);
        }

        return redirect()->route('admin.core.roles.index')->with('success', 'Role Created Successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        $this->authorize('view', $role);

        $role->load(['permissions']);

        $data = [
            'role' => $role,
        ];

        return Inertia::render('admin/core/roles/show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $this->authorize('update', $role);

        $permissions = Permission::with(['roles'])->select(['id', 'name'])->get();

        $role->load('permissions');

        $data = [
            'role' => $role,
            'permissions' => $permissions
        ];

        return Inertia::render('admin/core/roles/edit', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, Role $role)
    {
        $this->authorize('update', $role);

        $oldData = $role->replicate();
        $role->update([
            'name' => $request->name,
        ]);

        $role->permissions()->sync($request->permissions);

        if ($role) {
            $this->logSuccess('update-role', "Update Role: {$role->name}", [
                'role_id' => $role->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $role->toArray(),
            ]);
        } else {
            $this->logError('update-role', "Failed to update role: {$role->name}", [
                'role_id' => $role->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $role->toArray(),
            ]);
        }

        return redirect()->route('admin.core.roles.index')->with('success', 'Role Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);

        $role->delete();

        if ($role) {
            $this->logSuccess('delete-role', "Delete Role: {$role->name}", ['role_id' => $role->id]);
        } else {
            $this->logError('delete-role', "Failed to delete role: {$role->name}", ['role_id' => $role->id]);
        }

        return redirect()->route('admin.core.roles.index')->with('success', 'Role Deleted Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-role', Role::class);

        $perPage = $request->input('perPage', null);
        $page = $request->input('page', null);
        $globalSearch = $request->input('globalSearch', '');
        $orderDirection = $request->input('orderDirection', 'desc');
        $orderBy = $request->input('orderBy', 'id');

        $query = Role::query()
            ->with(['permissions'])
            ->latest()
            ->search($globalSearch)
            ->orderBy($orderBy, $orderDirection);

        $data = $perPage
            ? $query->paginate($perPage, ['*'], 'page', $page)
            : $query->get();

        return response()->json($data);
    }
}
