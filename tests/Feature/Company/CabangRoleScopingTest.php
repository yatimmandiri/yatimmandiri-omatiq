<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(UserRolePermissionSeeder::class);
});

test('cabang user sees scoped dashboard metrics for their branch', function () {
    $cabangUser = User::factory()->create([
        'name' => 'User Cabang Surabaya',
        'branch' => 'Surabaya',
        'email_verified_at' => now(),
    ]);
    $cabangUser->assignRole('Cabang');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);

    // Student & Participant in Surabaya
    $studentSby = Student::factory()->create([
        'full_name' => 'Santri Surabaya',
        'is_binaan' => true,
    ]);
    Participant::factory()->create([
        'student_id' => $studentSby->id,
        'olimpiade_id' => $olimpiade->id,
        'branch' => 'Surabaya',
        'status' => 'verified',
    ]);

    // Student & Participant in Malang
    $studentMlg = Student::factory()->create([
        'full_name' => 'Santri Malang',
        'is_binaan' => true,
    ]);
    Participant::factory()->create([
        'student_id' => $studentMlg->id,
        'olimpiade_id' => $olimpiade->id,
        'branch' => 'Malang',
        'status' => 'verified',
    ]);

    $response = $this->actingAs($cabangUser)->get(route('admin.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/dashboard/admin')
        ->where('participantCount', 1)
        ->where('verifiedParticipantCount', 1)
        ->where('branchName', 'Surabaya')
    );
});

test('cabang user getData participants is strictly scoped to branch', function () {
    $cabangUser = User::factory()->create([
        'name' => 'User Cabang Surabaya',
        'branch' => 'Surabaya',
        'email_verified_at' => now(),
    ]);
    $cabangUser->assignRole('Cabang');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);

    $pSby = Participant::factory()->create([
        'registration_number' => 'OMQ-SBY-001',
        'olimpiade_id' => $olimpiade->id,
        'branch' => 'Surabaya',
        'status' => 'verified',
    ]);

    $pMlg = Participant::factory()->create([
        'registration_number' => 'OMQ-MLG-001',
        'olimpiade_id' => $olimpiade->id,
        'branch' => 'Malang',
        'status' => 'verified',
    ]);

    $response = $this->actingAs($cabangUser)->getJson(route('admin.companies.participants.data'));

    $response->assertOk();
    $data = $response->json('data');

    expect(collect($data)->pluck('registration_number')->all())
        ->toContain('OMQ-SBY-001')
        ->not->toContain('OMQ-MLG-001');
});

test('cabang user getData students is scoped to branch', function () {
    $cabangUser = User::factory()->create([
        'name' => 'User Cabang Surabaya',
        'branch' => 'Surabaya',
        'email_verified_at' => now(),
    ]);
    $cabangUser->assignRole('Cabang');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);

    $studentSby = Student::factory()->create(['full_name' => 'Binaan Surabaya', 'is_binaan' => true]);
    Participant::factory()->create([
        'student_id' => $studentSby->id,
        'olimpiade_id' => $olimpiade->id,
        'branch' => 'Surabaya',
    ]);

    $studentMlg = Student::factory()->create(['full_name' => 'Binaan Malang', 'is_binaan' => true]);
    Participant::factory()->create([
        'student_id' => $studentMlg->id,
        'olimpiade_id' => $olimpiade->id,
        'branch' => 'Malang',
    ]);

    $response = $this->actingAs($cabangUser)->getJson(route('admin.companies.students.data'));

    $response->assertOk();
    $data = $response->json('data');

    expect(collect($data)->pluck('full_name')->all())
        ->toContain('Binaan Surabaya')
        ->not->toContain('Binaan Malang');
});

test('cabang user getData teachers is scoped to branch', function () {
    $cabangUser = User::factory()->create([
        'name' => 'User Cabang Surabaya',
        'branch' => 'Surabaya',
        'email_verified_at' => now(),
    ]);
    $cabangUser->assignRole('Cabang');

    $teacherSby = User::factory()->create(['name' => 'Guru Surabaya', 'branch' => 'Surabaya', 'email_verified_at' => now()]);
    $teacherSby->assignRole('Teacher');

    $teacherMlg = User::factory()->create(['name' => 'Guru Malang', 'branch' => 'Malang', 'email_verified_at' => now()]);
    $teacherMlg->assignRole('Teacher');

    $response = $this->actingAs($cabangUser)->getJson(route('admin.companies.teachers.data'));

    $response->assertOk();
    $data = $response->json('data');

    expect(collect($data)->pluck('name')->all())
        ->toContain('Guru Surabaya')
        ->not->toContain('Guru Malang');
});

test('cabang user is forbidden from accessing sanggars', function () {
    $cabangUser = User::factory()->create([
        'name' => 'User Cabang Surabaya',
        'branch' => 'Surabaya',
        'email_verified_at' => now(),
    ]);
    $cabangUser->assignRole('Cabang');

    $this->actingAs($cabangUser)->get(route('admin.companies.sanggars.index'))->assertForbidden();
    $this->actingAs($cabangUser)->getJson(route('admin.companies.sanggars.data'))->assertForbidden();
    $this->actingAs($cabangUser)->get(route('admin.companies.sanggars.show', 1))->assertForbidden();
});

test('cabang user does not receive sheets prop on participants index', function () {
    $cabangUser = User::factory()->create([
        'name' => 'User Cabang Surabaya',
        'branch' => 'Surabaya',
        'email_verified_at' => now(),
    ]);
    $cabangUser->assignRole('Cabang');

    $response = $this->actingAs($cabangUser)->get(route('admin.companies.participants.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/company/participant/list')
        ->where('sheets', null)
    );
});
