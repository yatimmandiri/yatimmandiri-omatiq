<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function createGuruManagementTeacher(array $attributes = []): User
{
    $role = Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);

    foreach (['view-participant', 'create-participant', 'data-participant', 'delete-participant', 'update-participant', 'view-student', 'create-student', 'update-student', 'delete-student', 'data-student'] as $permission) {
        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }

    $role->givePermissionTo(Permission::all());

    $teacher = User::factory()->create([
        'teacher_profile_completed_at' => now(),
        ...$attributes,
    ]);
    $teacher->assignRole($role);

    return $teacher;
}

beforeEach(function () {
    DB::table('provinces')->insert(['id' => '35', 'name' => 'JAWA TIMUR', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('regencies')->insert(['id' => '3578', 'province_id' => '35', 'name' => 'KOTA SURABAYA', 'created_at' => now(), 'updated_at' => now()]);
});

test('teacher can view data peserta list and only retrieves own participants in getData', function () {
    $teacher1 = createGuruManagementTeacher(['penyaluran_id' => 101]);
    $teacher2 = createGuruManagementTeacher(['penyaluran_id' => 102]);

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
    ]);

    $student1 = Student::create([
        'nik' => '3578010101010011',
        'full_name' => 'Binaan Guru 1',
        'gender' => 'male',
        'mentor_id' => $teacher1->id,
        'is_binaan' => true,
    ]);

    $student2 = Student::create([
        'nik' => '3578010101010022',
        'full_name' => 'Binaan Guru 2',
        'gender' => 'female',
        'mentor_id' => $teacher2->id,
        'is_binaan' => true,
    ]);

    $participant1 = Participant::create([
        'student_id' => $student1->id,
        'mentor_id' => $teacher1->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-GURU-001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $participant2 = Participant::create([
        'student_id' => $student2->id,
        'mentor_id' => $teacher2->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-GURU-002',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $this->actingAs($teacher1)
        ->get(route('teacher.data-peserta.index'))
        ->assertOk();

    $response = $this->actingAs($teacher1)
        ->getJson(route('teacher.data-peserta.data'));

    $response->assertOk();
    $data = $response->json('data');

    expect(count($data))->toBe(1)
        ->and($data[0]['registration_number'])->toBe('OMQ-GURU-001')
        ->and($data[0]['student']['full_name'])->toBe('Binaan Guru 1');
});

test('teacher can view participant details and delete (cancel) registration', function () {
    $teacher = createGuruManagementTeacher(['penyaluran_id' => 103]);

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade IPA',
        'category' => 'IPA',
    ]);

    $student = Student::create([
        'nik' => '3578010101010033',
        'full_name' => 'Binaan Batal',
        'gender' => 'male',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $participant = Participant::create([
        'student_id' => $student->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-CANCEL-001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $this->actingAs($teacher)
        ->get(route('teacher.data-peserta.show', $participant))
        ->assertOk();

    $response = $this->actingAs($teacher)
        ->delete(route('teacher.data-peserta.destroy', $participant));

    $response->assertRedirect(route('teacher.data-peserta.index'));
    $response->assertSessionHas('success');

    expect(Participant::find($participant->id))->toBeNull()
        ->and(Student::find($student->id))->not->toBeNull();
});

test('teacher cannot delete participant of another teacher', function () {
    $teacher1 = createGuruManagementTeacher(['penyaluran_id' => 104]);
    $teacher2 = createGuruManagementTeacher(['penyaluran_id' => 105]);

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade IPA', 'category' => 'IPA']);

    $student = Student::create([
        'nik' => '3578010101010044',
        'full_name' => 'Binaan Tetap',
        'gender' => 'female',
        'mentor_id' => $teacher1->id,
        'is_binaan' => true,
    ]);

    $participant = Participant::create([
        'student_id' => $student->id,
        'mentor_id' => $teacher1->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-KEEP-001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $this->actingAs($teacher2)
        ->delete(route('teacher.data-peserta.destroy', $participant))
        ->assertForbidden();

    expect(Participant::find($participant->id))->not->toBeNull();
});

test('teacher binaan getData parses students from penyaluran with registration indicator', function () {
    $teacher = createGuruManagementTeacher([
        'penyaluran_id' => 106,
        'penyaluran_token' => 'teacher-token-106',
    ]);

    Http::fake([
        '*/api/v1/guru/students*' => Http::response([
            'success' => true,
            'data' => [
                [
                    'id' => 701,
                    'name' => 'Santri Terdaftar',
                    'nik' => '3578010101010701',
                    'gender' => 'L',
                    'school_name' => 'SD 1',
                    'class' => '5',
                    'sanggar_id' => 1,
                ],
                [
                    'id' => 702,
                    'name' => 'Santri Belum Terdaftar',
                    'nik' => '3578010101010702',
                    'gender' => 'P',
                    'school_name' => 'SD 2',
                    'class' => '4',
                    'sanggar_id' => 1,
                ],
            ],
        ], 200),
        '*/api/v1/guru/sanggars' => Http::response([
            'success' => true,
            'data' => [
                ['id' => 1, 'name' => 'Sanggar Al-Huda', 'type' => 'Genius'],
            ],
        ], 200),
    ]);

    $student = Student::create([
        'penyaluran_id' => 701,
        'nik' => '3578010101010701',
        'full_name' => 'Santri Terdaftar',
        'gender' => 'male',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade MTK', 'category' => 'MTK']);

    Participant::create([
        'student_id' => $student->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-BINAAN-701',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $response = $this->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'teacher-token-106'])
        ->getJson(route('teacher.data-binaan.data'));

    $response->assertOk();
    $items = collect($response->json('data'));

    $registered = $items->firstWhere('id', 701);
    $unregistered = $items->firstWhere('id', 702);

    expect($registered['is_registered'])->toBeTrue()
        ->and($registered['registration_number'])->toBe('OMQ-BINAAN-701')
        ->and($unregistered['is_registered'])->toBeFalse();
});

test('teacher can update binaan details and calls penyaluran api', function () {
    $teacher = createGuruManagementTeacher([
        'penyaluran_id' => 107,
        'penyaluran_token' => 'teacher-token-107',
    ]);

    Http::fake([
        '*/api/v1/guru/students/801' => Http::response([
            'success' => true,
            'data' => ['id' => 801, 'name' => 'Santri Updated Name'],
        ], 200),
    ]);

    $student = Student::create([
        'penyaluran_id' => 801,
        'nik' => '3578010101010801',
        'full_name' => 'Santri Old Name',
        'gender' => 'male',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
        'birth_date' => '2014-01-01',
        'school_name' => 'SD 1',
        'grade' => '4',
        'address' => 'Jl. Test No. 1',
    ]);

    $response = $this->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'teacher-token-107'])
        ->put(route('teacher.data-binaan.update', $student), [
            'full_name' => 'Santri Updated Name',
            'gender' => 'male',
            'birth_date' => '2014-01-01',
            'school_name' => 'SD 1 Baru',
            'grade' => '5',
            'address' => 'Jl. Test No. 1 Baru',
            'parent_phone' => '081234567899',
            'province_id' => '35',
            'regency_id' => '3578',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('teacher.data-binaan.index'));

    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), 'api/v1/guru/students/801')
            && $request->method() === 'PUT'
            && $request['name'] === 'Santri Updated Name'
            && $request['class'] === '5';
    });

    expect($student->fresh()->full_name)->toBe('Santri Updated Name');
});

test('teacher can view sanggar and absensi pages', function () {
    $teacher = createGuruManagementTeacher(['penyaluran_id' => 108]);

    $this->actingAs($teacher)
        ->get(route('teacher.data-sanggar.index'))
        ->assertOk();

    $this->actingAs($teacher)
        ->get(route('teacher.absensi.index'))
        ->assertOk();
});
