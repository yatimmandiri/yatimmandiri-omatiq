<?php

namespace Database\Seeders;

use App\Models\Core\Permission;
use App\Models\Core\Role;
use App\Models\Core\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

class UserRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        collect([
            ['name' => 'Administrators', 'guard_name' => 'web'],
            ['name' => 'Users', 'guard_name' => 'web'],
        ])->each(fn($role) => Role::create($role));

        collect([
            ['name' => 'view-permission', 'guard_name' => 'web'],
            ['name' => 'create-permission', 'guard_name' => 'web'],
            ['name' => 'update-permission', 'guard_name' => 'web'],
            ['name' => 'delete-permission', 'guard_name' => 'web'],
            ['name' => 'data-permission', 'guard_name' => 'web'],
            ['name' => 'view-role', 'guard_name' => 'web'],
            ['name' => 'create-role', 'guard_name' => 'web'],
            ['name' => 'update-role', 'guard_name' => 'web'],
            ['name' => 'delete-role', 'guard_name' => 'web'],
            ['name' => 'data-role', 'guard_name' => 'web'],
            ['name' => 'view-user', 'guard_name' => 'web'],
            ['name' => 'create-user', 'guard_name' => 'web'],
            ['name' => 'update-user', 'guard_name' => 'web'],
            ['name' => 'delete-user', 'guard_name' => 'web'],
            ['name' => 'data-user', 'guard_name' => 'web'],
            ['name' => 'bulk-user', 'guard_name' => 'web'],
            ['name' => 'view-settings-site', 'guard_name' => 'web'],
            ['name' => 'update-settings-site', 'guard_name' => 'web'],

        ])->each(fn($permission) => Permission::create($permission)->assignRole('Administrators'));

        User::create([
            'name' => 'Administrator',
            'email' => 'scrum@yatimmandiri.org',
            'email_verified_at' => now(),
            'password' => Hash::make(uniqid()),
        ])->assignRole('Administrators');
    }
}
