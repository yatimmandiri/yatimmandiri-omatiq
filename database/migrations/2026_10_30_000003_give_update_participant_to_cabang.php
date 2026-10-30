<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $role = Role::where('name', 'Cabang')->first();
        if ($role) {
            $perm = Permission::firstOrCreate(['name' => 'update-participant', 'guard_name' => 'web']);
            $role->givePermissionTo($perm);
        }
    }

    public function down(): void
    {
        $role = Role::where('name', 'Cabang')->first();
        if ($role) {
            $role->revokePermissionTo('update-participant');
        }
    }
};
