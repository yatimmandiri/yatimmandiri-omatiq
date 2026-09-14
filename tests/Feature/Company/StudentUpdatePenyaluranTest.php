<?php

use App\Models\Company\Student;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrators', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Participant', 'guard_name' => 'web']);

    Permission::firstOrCreate(['name' => 'view-student', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'create-student', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'update-student', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'delete-student', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'data-student', 'guard_name' => 'web']);

    $adminRole = Role::findByName('Administrators', 'web');
    $adminRole->givePermissionTo(Permission::all());

    DB::table('provinces')->insert(['id' => '11', 'name' => 'JAWA TIMUR', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('regencies')->insert(['id' => '1101', 'province_id' => '11', 'name' => 'SURABAYA', 'created_at' => now(), 'updated_at' => now()]);
    $this->province = Province::find('11');
    $this->regency = Regency::find('1101');
});

test('admin can update student and syncs to penyaluran when penyaluran_id exists', function () {
    Http::fake([
        '*/api/v1/guru/students/915' => Http::response([
            'success' => true,
            'message' => 'Data santri/siswa berhasil diperbarui.',
            'data' => ['id' => 915, 'name' => 'Ahmad Updated'],
        ], 200),
    ]);

    $admin = User::factory()->create();
    $admin->assignRole('Administrators');

    $teacher = User::factory()->create([
        'penyaluran_id' => 10,
        'penyaluran_token' => 'teacher-token-abc',
    ]);
    $teacher->assignRole('Teacher');

    $student = Student::factory()->create([
        'penyaluran_id' => 915,
        'full_name' => 'Ahmad Awal',
        'nik' => '3578010101010001',
        'gender' => 'male',
        'mentor_id' => $teacher->id,
        'province_id' => $this->province->id,
        'regency_id' => $this->regency->id,
    ]);

    $response = $this
        ->actingAs($admin)
        ->put(route('admin.companies.students.update', $student), [
            'full_name' => 'Ahmad Updated',
            'nik' => '3578010101010001',
            'gender' => 'male',
            'birth_place' => 'Surabaya',
            'birth_date' => '2015-05-10',
            'school_name' => 'SDN 1 Surabaya',
            'grade' => '5',
            'address' => 'Jl. Pahlawan No. 1',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'parent_phone' => '081234567890',
            'mentor_id' => $teacher->id,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('admin.companies.students.index'));

    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), 'api/v1/guru/students/915')
            && $request->method() === 'PUT'
            && $request['name'] === 'Ahmad Updated'
            && $request['gender'] === 'L'
            && $request['class'] === '5';
    });

    expect($student->fresh()->full_name)->toBe('Ahmad Updated');
});

test('admin updating student without penyaluran_id does not call penyaluran api', function () {
    Http::fake();

    $admin = User::factory()->create();
    $admin->assignRole('Administrators');

    $student = Student::factory()->create([
        'penyaluran_id' => null,
        'full_name' => 'Budi Mandiri',
        'nik' => '3578010101010002',
        'gender' => 'male',
        'province_id' => $this->province->id,
        'regency_id' => $this->regency->id,
    ]);

    $response = $this
        ->actingAs($admin)
        ->put(route('admin.companies.students.update', $student), [
            'full_name' => 'Budi Updated',
            'nik' => '3578010101010002',
            'gender' => 'male',
            'birth_place' => 'Surabaya',
            'birth_date' => '2015-05-10',
            'school_name' => 'SDN 2 Surabaya',
            'grade' => '4',
            'address' => 'Jl. Pemuda No. 2',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'parent_phone' => '081234567891',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('admin.companies.students.index'));

    Http::assertNothingSent();
    expect($student->fresh()->full_name)->toBe('Budi Updated');
});

test('local database is not updated if penyaluran API fails', function () {
    Http::fake([
        '*/api/v1/guru/students/915' => Http::response([
            'success' => false,
            'message' => 'NIK sudah digunakan di Penyaluran.',
        ], 422),
    ]);

    $admin = User::factory()->create();
    $admin->assignRole('Administrators');

    $teacher = User::factory()->create([
        'penyaluran_id' => 10,
        'penyaluran_token' => 'teacher-token-abc',
    ]);
    $teacher->assignRole('Teacher');

    $student = Student::factory()->create([
        'penyaluran_id' => 915,
        'full_name' => 'Ahmad Tetap',
        'nik' => '3578010101010001',
        'gender' => 'male',
        'mentor_id' => $teacher->id,
        'province_id' => $this->province->id,
        'regency_id' => $this->regency->id,
    ]);

    $response = $this
        ->actingAs($admin)
        ->put(route('admin.companies.students.update', $student), [
            'full_name' => 'Ahmad Gagal',
            'nik' => '3578010101010001',
            'gender' => 'male',
            'birth_place' => 'Surabaya',
            'birth_date' => '2015-05-10',
            'school_name' => 'SDN 1 Surabaya',
            'grade' => '5',
            'address' => 'Jl. Pahlawan No. 1',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'parent_phone' => '081234567890',
            'mentor_id' => $teacher->id,
        ]);

    $response->assertSessionHasErrors(['nik']);
    expect($student->fresh()->full_name)->toBe('Ahmad Tetap');
});

test('teacher can update their assigned binaan and syncs to penyaluran', function () {
    Http::fake([
        '*/api/v1/guru/students/915' => Http::response([
            'success' => true,
            'data' => ['id' => 915, 'name' => 'Binaan Diupdate Guru'],
        ], 200),
    ]);

    $teacher = User::factory()->create([
        'penyaluran_id' => 10,
        'penyaluran_token' => 'teacher-token-xyz',
    ]);
    $teacher->assignRole('Teacher');

    $student = Student::factory()->create([
        'penyaluran_id' => 915,
        'full_name' => 'Binaan Guru Awal',
        'nik' => '3578010101010003',
        'gender' => 'female',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
        'province_id' => $this->province->id,
        'regency_id' => $this->regency->id,
    ]);

    $response = $this
        ->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'teacher-token-xyz'])
        ->put(route('teacher.data-binaan.update', $student), [
            'full_name' => 'Binaan Diupdate Guru',
            'gender' => 'female',
            'birth_date' => '2016-08-15',
            'school_name' => 'SD Binaan Surabaya',
            'grade' => '3',
            'address' => 'Jl. Binaan No. 3',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('teacher.data-binaan.index'));

    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), 'api/v1/guru/students/915')
            && $request->method() === 'PUT'
            && $request['name'] === 'Binaan Diupdate Guru'
            && $request['gender'] === 'P'
            && $request['class'] === '3';
    });

    expect($student->fresh()->full_name)->toBe('Binaan Diupdate Guru');
});

test('teacher cannot update another teacher student', function () {
    $teacher1 = User::factory()->create(['penyaluran_id' => 10]);
    $teacher1->assignRole('Teacher');

    $teacher2 = User::factory()->create(['penyaluran_id' => 20]);
    $teacher2->assignRole('Teacher');

    $student = Student::factory()->create([
        'penyaluran_id' => 915,
        'full_name' => 'Binaan Milik Guru 2',
        'mentor_id' => $teacher2->id,
        'is_binaan' => true,
        'province_id' => $this->province->id,
        'regency_id' => $this->regency->id,
    ]);

    $response = $this
        ->actingAs($teacher1)
        ->put(route('teacher.data-binaan.update', $student), [
            'full_name' => 'Hacked Name',
            'gender' => 'male',
            'birth_date' => '2016-08-15',
            'school_name' => 'SD Binaan',
            'grade' => '3',
            'address' => 'Jl. Binaan',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
        ]);

    $response->assertForbidden();
    expect($student->fresh()->full_name)->toBe('Binaan Milik Guru 2');
});

test('resolveBinaan updates local student with fresh data from penyaluran api on edit', function () {
    Http::fake([
        '*/api/v1/guru/students' => Http::response([
            'success' => true,
            'data' => [
                [
                    'student_id' => 999,
                    'name' => 'Nama Baru Dari Penyaluran',
                    'nik' => '3578010101010999',
                    'gender' => 'P',
                    'school_name' => 'SMP Penyaluran Baru',
                    'class' => '7',
                    'address' => 'Alamat Baru',
                    'guardian_phone' => '089999999999',
                ],
            ],
        ], 200),
    ]);

    $teacher = User::factory()->create([
        'penyaluran_id' => 30,
        'penyaluran_token' => 'teacher-token-sync',
    ]);
    $teacher->assignRole('Teacher');

    $student = Student::factory()->create([
        'penyaluran_id' => 999,
        'full_name' => 'Nama Lama Lokal',
        'nik' => '3578010101010999',
        'gender' => 'male',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $response = $this
        ->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'teacher-token-sync'])
        ->get(route('teacher.data-binaan.edit', $student));

    $response->assertOk();

    $student->refresh();
    expect($student->full_name)->toBe('Nama Baru Dari Penyaluran')
        ->and($student->gender)->toBe('female')
        ->and($student->grade)->toBe('7')
        ->and($student->school_name)->toBe('SMP Penyaluran Baru')
        ->and($student->address)->toBe('Alamat Baru');
});

test('admin edit resolves and updates local student with fresh data from penyaluran api', function () {
    Http::fake([
        '*/api/v1/guru/students' => Http::response([
            'success' => true,
            'data' => [
                [
                    'student_id' => 888,
                    'name' => 'Santri Terupdate Dari Penyaluran',
                    'nik' => '3578010101010888',
                    'gender' => 'L',
                    'school_name' => 'SD Penyaluran Maju',
                    'class' => '6',
                    'address' => 'Jl. Penyaluran No. 8',
                    'guardian_phone' => '088888888888',
                ],
            ],
        ], 200),
    ]);

    $admin = User::factory()->create();
    $admin->assignRole('Administrators');

    $teacher = User::factory()->create([
        'penyaluran_id' => 30,
        'penyaluran_token' => 'teacher-token-sync',
    ]);
    $teacher->assignRole('Teacher');

    $student = Student::factory()->create([
        'penyaluran_id' => 888,
        'full_name' => 'Nama Lama Santri Lokal',
        'nik' => '3578010101010888',
        'gender' => 'female',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $response = $this
        ->actingAs($admin)
        ->get(route('admin.companies.students.edit', $student));

    $response->assertOk();

    $student->refresh();
    expect($student->full_name)->toBe('Santri Terupdate Dari Penyaluran')
        ->and($student->gender)->toBe('male')
        ->and($student->grade)->toBe('6')
        ->and($student->school_name)->toBe('SD Penyaluran Maju')
        ->and($student->address)->toBe('Jl. Penyaluran No. 8');
});
