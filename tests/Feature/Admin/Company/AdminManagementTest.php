<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function createSuperAdmin(): User
{
    $adminRole = Role::firstOrCreate(['name' => 'Administrators', 'guard_name' => 'web']);

    $permissions = [
        'view-participant', 'create-participant', 'update-participant', 'delete-participant', 'data-participant',
        'view-student', 'create-student', 'update-student', 'delete-student', 'data-student',
        'view-user', 'create-user', 'update-user', 'delete-user', 'data-user',
    ];

    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
    }

    $adminRole->givePermissionTo(Permission::all());

    $admin = User::factory()->create();
    $admin->assignRole($adminRole);

    return $admin;
}

beforeEach(function () {
    DB::table('provinces')->insert(['id' => '35', 'name' => 'JAWA TIMUR', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('regencies')->insert(['id' => '3578', 'province_id' => '35', 'name' => 'KOTA SURABAYA', 'created_at' => now(), 'updated_at' => now()]);
});

test('admin can view participants list and filter getData', function () {
    $admin = createSuperAdmin();

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade MTK 2026', 'category' => 'Matematika', 'event_year' => 2026]);

    $student = Student::create([
        'nik' => '3578010101010999',
        'full_name' => 'Peserta Admin',
        'gender' => 'male',
        'is_binaan' => false,
    ]);

    Participant::create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-ADM-001',
        'registration_type' => 'public',
        'status' => 'submitted',
        'event_year' => 2026,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.companies.participants.index'))
        ->assertOk();

    $response = $this->actingAs($admin)
        ->getJson(route('admin.companies.participants.data', [
            'filterValue' => ['status' => 'submitted'],
        ]));

    $response->assertOk();
    $data = $response->json('data');

    expect(count($data))->toBe(1)
        ->and($data[0]['registration_number'])->toBe('OMQ-ADM-001');
});

test('admin can update participant inline status to verified or rejected', function () {
    $admin = createSuperAdmin();

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade IPA 2026', 'category' => 'IPA']);

    $student = Student::create([
        'nik' => '3578010101010998',
        'full_name' => 'Peserta Status',
        'gender' => 'female',
    ]);

    $participant = Participant::create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-ADM-002',
        'registration_type' => 'public',
        'status' => 'submitted',
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.companies.participants.status', $participant), [
            'status' => 'verified',
            'notes' => 'Pembayaran telah valid',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($participant->fresh()->status)->toBe('verified')
        ->and($participant->fresh()->notes)->toBe('Pembayaran telah valid');
});

test('admin can edit participant and synced student master data', function () {
    $admin = createSuperAdmin();

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade MTK', 'category' => 'Matematika']);

    $student = Student::create([
        'nik' => '3578010101010997',
        'full_name' => 'Nama Sebelum Edit',
        'gender' => 'male',
        'birth_place' => 'Surabaya',
        'birth_date' => '2014-01-01',
        'school_name' => 'SD 1',
        'grade' => '4',
        'address' => 'Jl. A',
        'parent_phone' => '081234567800',
    ]);

    $participant = Participant::create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-ADM-003',
        'registration_type' => 'public',
        'status' => 'submitted',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.companies.participants.edit', $participant))
        ->assertOk();

    $response = $this->actingAs($admin)
        ->put(route('admin.companies.participants.update', $participant), [
            'olimpiade_id' => $olimpiade->id,
            'full_name' => 'Nama Setelah Edit',
            'nickname' => 'Nama',
            'gender' => 'male',
            'birth_place' => 'Surabaya',
            'birth_date' => '2014-01-01',
            'school_name' => 'SD 1 Baru',
            'grade' => '5',
            'address' => 'Jl. A Baru',
            'province_id' => '35',
            'regency_id' => '3578',
            'parent_phone' => '081234567801',
            'nik' => '3578010101010997',
            'branch' => 'SURABAYA PUSAT',
            'participant_signature_name' => 'Nama Setelah Edit',
            'guardian_signature_name' => 'Wali Murid',
            'status' => 'verified',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('admin.companies.participants.index'));

    expect($student->fresh()->full_name)->toBe('Nama Setelah Edit')
        ->and($student->fresh()->grade)->toBe('5');
});

test('admin can delete participant record', function () {
    $admin = createSuperAdmin();

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade IPA', 'category' => 'IPA']);

    $student = Student::create([
        'nik' => '3578010101010996',
        'full_name' => 'Peserta Hapus',
        'gender' => 'female',
    ]);

    $participant = Participant::create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-ADM-004',
        'registration_type' => 'public',
        'status' => 'submitted',
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.companies.participants.destroy', $participant));

    $response->assertRedirect(route('admin.companies.participants.index'));
    expect(Participant::find($participant->id))->toBeNull();
});

test('admin can toggle student active status', function () {
    $admin = createSuperAdmin();

    $student = Student::create([
        'nik' => '3578010101010995',
        'full_name' => 'Siswa Toggle Status',
        'gender' => 'male',
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.companies.students.status', $student));

    $response->assertRedirect();
    expect($student->fresh()->is_active)->toBeFalse();

    // Toggle back
    $this->actingAs($admin)->put(route('admin.companies.students.status', $student));
    expect($student->fresh()->is_active)->toBeTrue();
});

test('admin cannot delete student if active participant registrations exist', function () {
    $admin = createSuperAdmin();

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade IPA', 'category' => 'IPA']);

    $student = Student::create([
        'nik' => '3578010101010994',
        'full_name' => 'Siswa Tidak Bisa Hapus',
        'gender' => 'female',
    ]);

    Participant::create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-ADM-005',
        'status' => 'submitted',
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.companies.students.destroy', $student));

    $response->assertRedirect(route('admin.companies.students.index'));
    $response->assertSessionHas('error');

    expect(Student::find($student->id))->not->toBeNull();
});

test('admin can delete student when no participant registrations exist', function () {
    $admin = createSuperAdmin();

    $student = Student::create([
        'nik' => '3578010101010993',
        'full_name' => 'Siswa Bisa Hapus',
        'gender' => 'male',
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.companies.students.destroy', $student));

    $response->assertRedirect(route('admin.companies.students.index'));
    $response->assertSessionHas('success');

    expect(Student::find($student->id))->toBeNull();
});

test('admin teacher module is read-only and allows password reset', function () {
    $admin = createSuperAdmin();

    $teacherRole = Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);
    $teacher = User::factory()->create([
        'name' => 'Guru Read Only',
        'email' => 'guru.ro@example.com',
        'password' => Hash::make('secret-custom-password'),
    ]);
    $teacher->assignRole($teacherRole);

    $this->actingAs($admin)
        ->get(route('admin.companies.teachers.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.companies.teachers.show', $teacher))
        ->assertOk();

    // Verify Read-Only Protection: unexposed routes return 404/405
    $this->actingAs($admin)->get('/admin/companies/teachers/create')->assertNotFound();
    $this->actingAs($admin)->post('/admin/companies/teachers', [])->assertMethodNotAllowed();
    $this->actingAs($admin)->get("/admin/companies/teachers/{$teacher->id}/edit")->assertNotFound();
    $this->actingAs($admin)->delete("/admin/companies/teachers/{$teacher->id}")->assertMethodNotAllowed();

    // Password reset functionality (PUT /admin/companies/teachers/{teacher}/reset-password)
    $response = $this->actingAs($admin)
        ->put(route('admin.companies.teachers.reset-password', $teacher));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Hash::check('password', $teacher->fresh()->password))->toBeTrue();
});
