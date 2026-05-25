<?php

namespace App\Http\Controllers\Admin\Core;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Core\StorePermissionRequest;
use App\Http\Requests\Core\UpdatePermissionRequest;
use App\Models\Core\Permission;
use App\Models\Core\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    use LogActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Permission::class);

        $data = [
            'pageTitle' => 'Permission List',
        ];

        return Inertia::render('admin/core/permissions/list', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Permission::class);

        $roles = Role::with('permissions')->select(['id', 'name'])->get();

        $data = [
            'roles' => $roles
        ];

        return Inertia::render('admin/core/permissions/create', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePermissionRequest $request)
    {
        $this->authorize('create', Permission::class);

        $permission = Permission::create([
            'name' => $request->name,
        ]);

        if ($permission) {
            $this->logSuccess('create-permission', "Created Permission: {$permission->name}", [
                'permission_id' => $permission->id,
                'new_data' => $permission->toArray(),
            ]);
        } else {
            $this->logError('create-permission', "Failed To Create Permission: {$permission->name}", [
                'permission_id' => $permission->id,
                'new_data' => $permission->toArray(),
            ]);
        }

        return redirect()->route('admin.core.permissions.index')->with('success', 'Permission Created Successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        $this->authorize('view', $permission);

        $data = [
            'permission' => $permission,
        ];

        return Inertia::render('admin/core/permissions/show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Permission $permission)
    {
        $this->authorize('update', $permission);

        $permission->load(['roles']);

        $data = [
            'permission' => $permission,
        ];

        return Inertia::render('admin/core/permissions/edit', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePermissionRequest $request, Permission $permission)
    {
        $this->authorize('update', $permission);

        $oldData = $permission->replicate();
        $permission->update([
            'name' => $request->name,
        ]);

        if ($permission) {
            $this->logSuccess('update-permission', "Update Permission: {$permission->name}", [
                'permission_id' => $permission->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $permission->toArray(),
            ]);
        } else {
            $this->logError('update-permission', "Failed To Update Permission: {$permission->name}", [
                'permission_id' => $permission->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $permission->toArray(),
            ]);
        }

        return redirect()->route('admin.core.permissions.index')->with('success', 'Permission Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission)
    {
        $this->authorize('delete', $permission);

        $permission->delete();

        if ($permission) {
            $this->logSuccess('delete-permission', "Delete Permission: {$permission->name}", ['permission_id' => $permission->id]);
        } else {
            $this->logError('delete-permission', "Failed To Delete Permission: {$permission->name}", ['permission_id' => $permission->id]);
        }

        return redirect()->route('admin.core.permissions.index')->with('success', 'Permission Deleted Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-permission', Permission::class);

        $perPage = $request->input('perPage', null);
        $page = $request->input('page', 1);
        $globalSearch = $request->input('globalSearch', '');
        $orderDirection = $request->input('orderDirection', 'desc');
        $orderBy = $request->input('orderBy', 'id');

        $query = Permission::query()
            ->with(['roles'])
            ->latest()
            ->search($globalSearch)
            ->orderBy($orderBy, $orderDirection);

        $data = $perPage
            ? $query->paginate($perPage, ['*'], 'page', $page)
            : $query->get();

        return response()->json($data);
    }
}
