<?php

namespace Database\Seeders;

use App\Models\Core\Permission;
use App\Models\Core\Region\District;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Region\Village;
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
            ['name' => 'view-province', 'guard_name' => 'web'],
            ['name' => 'create-province', 'guard_name' => 'web'],
            ['name' => 'update-province', 'guard_name' => 'web'],
            ['name' => 'delete-province', 'guard_name' => 'web'],
            ['name' => 'data-province', 'guard_name' => 'web'],
            ['name' => 'view-regency', 'guard_name' => 'web'],
            ['name' => 'create-regency', 'guard_name' => 'web'],
            ['name' => 'update-regency', 'guard_name' => 'web'],
            ['name' => 'delete-regency', 'guard_name' => 'web'],
            ['name' => 'data-regency', 'guard_name' => 'web'],
            ['name' => 'view-district', 'guard_name' => 'web'],
            ['name' => 'create-district', 'guard_name' => 'web'],
            ['name' => 'update-district', 'guard_name' => 'web'],
            ['name' => 'delete-district', 'guard_name' => 'web'],
            ['name' => 'data-district', 'guard_name' => 'web'],
            ['name' => 'view-village', 'guard_name' => 'web'],
            ['name' => 'create-village', 'guard_name' => 'web'],
            ['name' => 'update-village', 'guard_name' => 'web'],
            ['name' => 'delete-village', 'guard_name' => 'web'],
            ['name' => 'data-village', 'guard_name' => 'web'],
            ['name' => 'view-log-activity', 'guard_name' => 'web'],
            ['name' => 'data-log-activity', 'guard_name' => 'web'],
        ])->each(fn($permission) => Permission::create($permission)->assignRole('Administrators'));

        User::create([
            'name' => 'Administrator',
            'email' => 'scrum@yatimmandiri.org',
            'email_verified_at' => now(),
            'password' => Hash::make(uniqid()),
        ])->assignRole('Administrators');

        Province::query()->update([
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Regency::query()->update([
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        District::query()->update([
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Village::query()->update([
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
