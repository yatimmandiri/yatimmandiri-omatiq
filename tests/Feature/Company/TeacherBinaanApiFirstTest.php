<?php

use App\Models\Company\Student;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);

    Permission::firstOrCreate(['name' => 'view-student', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'create-student', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'update-student', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'delete-student', 'guard_name' => 'web']);
});

test('edit binaan builds form directly from penyaluran api and refreshes stale local mirror', function () {
    Http::fake([
        '*/api/v1/guru/me' => Http::response(['success' => false, 'message' => 'Unauthenticated.'], 401),
        '*/api/v1/students*' => Http::response(['success' => true, 'data' => []], 200),
        '*/api/v1/guru/students' => Http::response([
            'success' => true,
            'data' => [
                [
                    'student_id' => 921,
                    'name' => 'Nama Fresh Dari API',
                    'nik' => '3578010101010921',
                    'gender' => 'P',
                    'school_name' => 'SMP API Baru',
                    'class' => '7',
                    'address' => 'Jl. API No. 9',
                    'guardian_phone' => '089211111111',
                ],
            ],
        ], 200),
    ]);

    $teacher = User::factory()->create([
        'penyaluran_id' => 91,
        'penyaluran_token' => 'teacher-token-edit-api',
    ]);
    $teacher->assignRole('Teacher');

    $student = Student::factory()->create([
        'penyaluran_id' => 921,
        'full_name' => 'Nama Lama Lokal',
        'nik' => '3578010101010921',
        'gender' => 'male',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $response = $this
        ->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'teacher-token-edit-api'])
        ->get(route('teacher.data-binaan.edit', 921));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('teacher/data-binaan/edit')
        ->where('binaan.full_name', 'Nama Fresh Dari API')
        ->where('binaan.is_api_source', true)
    );

    $student->refresh();
    expect($student->full_name)->toBe('Nama Fresh Dari API')
        ->and($student->gender)->toBe('female')
        ->and($student->grade)->toBe('7');
});

test('update binaan puts directly to penyaluran api when roster contains the student', function () {
    Http::fake([
        '*/api/v1/guru/me' => Http::response(['success' => false, 'message' => 'Unauthenticated.'], 401),
        '*/api/v1/students*' => Http::response(['success' => true, 'data' => []], 200),
        '*/api/v1/guru/students' => Http::response([
            'success' => true,
            'data' => [
                [
                    'student_id' => 922,
                    'name' => 'Santri Roster',
                    'nik' => '3578010101010922',
                    'gender' => 'L',
                    'school_name' => 'SD Roster',
                    'class' => '4',
                    'address' => 'Jl. Roster No. 1',
                    'guardian_phone' => '089222222222',
                ],
            ],
        ], 200),
        '*/api/v1/guru/students/922' => Http::response([
            'success' => true,
            'data' => ['id' => 922, 'name' => 'Santri Roster'],
        ], 200),
    ]);

    $teacher = User::factory()->create([
        'penyaluran_id' => 92,
        'penyaluran_token' => 'teacher-token-update-api',
    ]);
    $teacher->assignRole('Teacher');

    $student = Student::factory()->create([
        'penyaluran_id' => 922,
        'full_name' => 'Santri Roster',
        'nik' => '3578010101010922',
        'gender' => 'male',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $response = $this
        ->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'teacher-token-update-api'])
        ->put(route('teacher.data-binaan.update', 922), [
            'school_name' => 'SD Roster Baru',
            'grade' => '5',
            'address' => 'Jl. Roster No. 2',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('teacher.data-binaan.index'));

    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), 'api/v1/guru/students/922')
            && $request->method() === 'PUT'
            && $request['school_name'] === 'SD Roster Baru'
            && $request['class'] === '5';
    });

    expect($student->fresh()->school_name)->toBe('SD Roster Baru')
        ->and($student->fresh()->grade)->toBe('5');
});

test('teacher cannot update binaan outside their penyaluran roster', function () {
    Http::fake([
        '*/api/v1/guru/me' => Http::response(['success' => false, 'message' => 'Unauthenticated.'], 401),
        '*/api/v1/students*' => Http::response(['success' => true, 'data' => []], 200),
        '*/api/v1/guru/students' => Http::response([
            'success' => true,
            'data' => [],
        ], 200),
    ]);

    $teacherA = User::factory()->create(['penyaluran_id' => 93]);
    $teacherA->assignRole('Teacher');

    $teacherB = User::factory()->create(['penyaluran_id' => 94]);
    $teacherB->assignRole('Teacher');

    $student = Student::factory()->create([
        'penyaluran_id' => 950,
        'full_name' => 'Binaan Milik Guru B',
        'mentor_id' => $teacherB->id,
        'is_binaan' => true,
    ]);

    $response = $this
        ->actingAs($teacherA)
        ->withSession(['penyaluran_token' => 'teacher-token-roster-guard'])
        ->put(route('teacher.data-binaan.update', 950), [
            'school_name' => 'SD Coba Curi',
            'grade' => '3',
            'address' => 'Jl. Curi No. 1',
        ]);

    $response->assertForbidden();

    Http::assertNotSent(function (Request $request) {
        return $request->method() === 'PUT' && str_contains($request->url(), 'api/v1/guru/students/950');
    });

    expect($student->fresh()->full_name)->toBe('Binaan Milik Guru B');
});
