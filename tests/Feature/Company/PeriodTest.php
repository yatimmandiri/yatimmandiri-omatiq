<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Period;
use App\Models\Core\Permission;
use App\Models\Core\Role;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $permissions = [
        'view-period',
        'create-period',
        'update-period',
        'delete-period',
        'data-period',
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }
});

function createAdminUser(): User
{
    $role = Role::firstOrCreate(['name' => 'Administrators', 'guard_name' => 'web']);

    $permissions = [
        'view-period',
        'create-period',
        'update-period',
        'delete-period',
        'data-period',
    ];

    $role->syncPermissions($permissions);

    $admin = User::factory()->create();
    $admin->assignRole($role);

    return $admin;
}

it('allows an administrator to view period list and fetch datatable data', function () {
    $admin = createAdminUser();

    $period = Period::create([
        'name' => 'OMATIQ 2026',
        'year' => 2026,
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.companies.periods.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->getJson(route('admin.companies.periods.data'))
        ->assertOk()
        ->assertJsonFragment([
            'name' => 'OMATIQ 2026',
            'year' => 2026,
            'is_active' => true,
        ]);
});

it('allows an administrator to create a period and deactivates others when active is true', function () {
    $admin = createAdminUser();

    $oldPeriod = Period::create([
        'name' => 'OMATIQ 2025',
        'year' => 2025,
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.companies.periods.store'), [
            'name' => 'OMATIQ 2026',
            'year' => 2026,
            'is_active' => true,
            'description' => 'Tahun 2026',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);

    $response->assertRedirect(route('admin.companies.periods.index'))
        ->assertSessionHas('success');

    $newPeriod = Period::where('year', 2026)->first();
    expect($newPeriod)->not->toBeNull()
        ->and($newPeriod->is_active)->toBeTrue();

    expect($oldPeriod->fresh()->is_active)->toBeFalse();
});

it('allows an administrator to update a period', function () {
    $admin = createAdminUser();

    $period = Period::create([
        'name' => 'OMATIQ 2026',
        'year' => 2026,
        'is_active' => false,
    ]);

    $this->actingAs($admin)
        ->put(route('admin.companies.periods.update', $period->id), [
            'name' => 'OMATIQ 2026 Updated',
            'year' => 2026,
            'is_active' => false,
            'description' => 'Updated desc',
        ])
        ->assertRedirect(route('admin.companies.periods.index'))
        ->assertSessionHas('success');

    expect($period->fresh()->name)->toBe('OMATIQ 2026 Updated');
});

it('allows an administrator to toggle period status', function () {
    $admin = createAdminUser();

    $periodA = Period::create([
        'name' => 'OMATIQ 2025',
        'year' => 2025,
        'is_active' => true,
    ]);

    $periodB = Period::create([
        'name' => 'OMATIQ 2026',
        'year' => 2026,
        'is_active' => false,
    ]);

    $this->actingAs($admin)
        ->put(route('admin.companies.periods.status', $periodB->id))
        ->assertSessionHas('success');

    expect($periodB->fresh()->is_active)->toBeTrue()
        ->and($periodA->fresh()->is_active)->toBeFalse();
});

it('allows deleting an unreferenced period but prevents deleting a period with olympiades or participants', function () {
    $admin = createAdminUser();

    $periodEmpty = Period::create([
        'name' => 'OMATIQ 2024',
        'year' => 2024,
        'is_active' => false,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.companies.periods.destroy', $periodEmpty->id))
        ->assertRedirect(route('admin.companies.periods.index'))
        ->assertSessionHas('success');

    expect(Period::find($periodEmpty->id))->toBeNull();

    $periodWithOlimpiade = Period::create([
        'name' => 'OMATIQ 2026',
        'year' => 2026,
        'is_active' => true,
    ]);

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
        'event_year' => 2026,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.companies.periods.destroy', $periodWithOlimpiade->id))
        ->assertSessionHas('error');

    expect(Period::find($periodWithOlimpiade->id))->not->toBeNull();
});

it('blocks non-admin users from accessing period management', function () {
    $teacherRole = Role::firstOrCreate(['name' => 'Teacher']);
    $user = User::factory()->create();
    $user->assignRole($teacherRole);

    $period = Period::create([
        'name' => 'OMATIQ 2026',
        'year' => 2026,
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->get(route('admin.companies.periods.index'))
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('admin.companies.periods.store'), ['name' => 'Test', 'year' => 2027])
        ->assertForbidden();
});

it('correctly resolves period relationships and current period helper', function () {
    $period2025 = Period::create([
        'name' => 'OMATIQ 2025',
        'year' => 2025,
        'is_active' => false,
    ]);

    $period2026 = Period::create([
        'name' => 'OMATIQ 2026',
        'year' => 2026,
        'is_active' => true,
    ]);

    $olimpiade2025 = Olimpiade::create([
        'name' => 'Olimpiade MTK 2025',
        'category' => 'Matematika',
        'event_year' => 2025,
    ]);

    $olimpiade2026 = Olimpiade::create([
        'name' => 'Olimpiade MTK 2026',
        'category' => 'Matematika',
        'event_year' => 2026,
    ]);

    expect($period2026->olimpiades)->toHaveCount(1)
        ->and($period2025->olimpiades)->toHaveCount(1)
        ->and(Period::current()->id)->toBe($period2026->id)
        ->and($olimpiade2026->period->id)->toBe($period2026->id)
        ->and(Olimpiade::forCurrentPeriod()->pluck('id')->all())->toContain($olimpiade2026->id)
        ->and(Olimpiade::forCurrentPeriod()->pluck('id')->all())->not->toContain($olimpiade2025->id)
        ->and(Olimpiade::forYear(2025)->pluck('id')->all())->toContain($olimpiade2025->id);
});
