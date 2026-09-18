<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\TeacherService;
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
            'school_name' => 'SD 1 Baru',
            'school_level' => 'SD',
            'grade' => '5',
            'address' => 'Jl. Test No. 1 Baru',
            'province_id' => '35',
            'regency_id' => '3578',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('teacher.data-binaan.index'));

    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), 'api/v1/guru/students/801')
            && $request->method() === 'PUT'
            && $request['class'] === '5'
            && $request['school_name'] === 'SD 1 Baru'
            && $request['address'] === 'Jl. Test No. 1 Baru';
    });

    expect($student->fresh()->school_name)->toBe('SD 1 Baru')
        ->and($student->fresh()->grade)->toBe('5')
        ->and($student->fresh()->address)->toBe('Jl. Test No. 1 Baru');
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

test('teacher form options does not collide local auto increment student id with penyaluran student id', function () {
    $teacherService = app(TeacherService::class);

    // Create an unrelated local participant whose local student_id is 31
    $otherStudent = Student::create([
        'id' => 31,
        'nik' => '9999999999999999',
        'full_name' => 'Other Local Student',
        'gender' => 'male',
        'is_binaan' => false,
    ]);

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade IPA', 'category' => 'IPA', 'event_year' => 2026]);

    Participant::create([
        'student_id' => $otherStudent->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-31',
        'registration_type' => 'user',
        'status' => 'verified',
        'event_year' => 2026,
    ]);

    // Penyaluran student roster has a student whose Penyaluran student_id is 31, but with different NIK
    $penyaluranRoster = [
        [
            'student_id' => 31,
            'id' => 31,
            'name' => 'ADELIO ABRISAM ATTAR',
            'nik' => '3402160109160001',
            'gender' => 'L',
            'status' => true,
        ],
        [
            'student_id' => 30,
            'id' => 30,
            'name' => 'NAFLA MAHIRA RIFDA',
            'nik' => '3402166011140001',
            'gender' => 'P',
            'status' => true,
        ],
    ];

    $options = $teacherService->getFormOptionsFromApi($penyaluranRoster, 31, 2026);

    expect(count($options['students']))->toBe(2)
        ->and($options['students'][0]['id'])->toBe(31)
        ->and($options['students'][0]['full_name'])->toBe('ADELIO ABRISAM ATTAR')
        ->and($options['preselected_student_id'])->toBe(31);
});

test('teacher can register penyaluran binaan even if local student table already has an active participant with same auto-increment id', function () {
    $teacher = createGuruManagementTeacher([
        'penyaluran_id' => 200,
        'penyaluran_token' => 'teacher-token-200',
    ]);

    // Populate local student #31 as an active registered participant
    $otherLocalStudent = Student::create([
        'id' => 31,
        'nik' => '9999999999999999',
        'full_name' => 'Existing Participant 31',
        'gender' => 'female',
        'is_binaan' => false,
    ]);

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika', 'event_year' => 2026]);

    Participant::create([
        'student_id' => $otherLocalStudent->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-LOCAL-31',
        'registration_type' => 'user',
        'status' => 'verified',
        'event_year' => 2026,
    ]);

    // Mock Penyaluran API response returning student_id 31 with Adelio's info
    Http::fake([
        '*/api/v1/guru/students*' => Http::response([
            'success' => true,
            'data' => [
                [
                    'id' => 31,
                    'student_id' => 31,
                    'name' => 'ADELIO ABRISAM ATTAR',
                    'nik' => '3402160109160001',
                    'gender' => 'L',
                    'school_name' => 'SD Al-Firdaus',
                    'class' => '3',
                    'sanggar_id' => 15,
                ],
            ],
        ], 200),
        '*/api/v1/guru/sanggars' => Http::response([
            'success' => true,
            'data' => [
                ['id' => 15, 'name' => 'SANGGAR GENIUS AL FIRDAUS', 'type' => 'Genius'],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'teacher-token-200'])
        ->post(route('teacher.data-peserta.store'), [
            'penyaluran_student_id' => 31,
            'penyaluran_sanggar_id' => 15,
            'olimpiade_id' => $olimpiade->id,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('teacher.data-peserta.index'));

    // Verify both participants exist safely without colliding
    $newParticipant = Participant::where('registration_type', 'teacher')->first();
    expect($newParticipant)->not->toBeNull()
        ->and($newParticipant->mentor_id)->toBe($teacher->id)
        ->and($newParticipant->student->penyaluran_id)->toBe(31)
        ->and($newParticipant->student->nik)->toBe('3402160109160001')
        ->and($newParticipant->student->full_name)->toBe('ADELIO ABRISAM ATTAR');
});

test('teacher dashboard retrieves metrics and sanggars from session data directly', function () {
    $teacher = createGuruManagementTeacher([
        'penyaluran_id' => 300,
        'penyaluran_token' => 'teacher-token-300',
    ]);

    $sessionProfile = [
        'id' => 300,
        'name' => 'Guru Hebat',
        'email' => 'guru300@penyaluran.local',
        'kantor_name' => 'KANTOR CABANG SURABAYA',
        'sanggars' => [
            ['id' => 10, 'name' => 'Sanggar Berkah', 'type' => 'Genius', 'total_students' => 5],
        ],
        'students' => [
            ['id' => 501, 'student_id' => 501, 'name' => 'Santri 1', 'nik' => '3578000000000001', 'gender' => 'L', 'sanggar_id' => 10],
            ['id' => 502, 'student_id' => 502, 'name' => 'Santri 2', 'nik' => '3578000000000002', 'gender' => 'P', 'sanggar_id' => 10],
        ],
    ];

    $response = $this->actingAs($teacher)
        ->withSession([
            'penyaluran_token' => 'teacher-token-300',
            'penyaluran_me' => $sessionProfile,
            'penyaluran_sanggars' => $sessionProfile['sanggars'],
            'penyaluran_students' => $sessionProfile['students'],
        ])
        ->get(route('teacher.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/dashboard/teacher')
        ->where('studentCount', 2)
        ->where('penyaluranTotal', 2)
        ->where('sanggarCount', 1)
        ->where('sanggarSum', 5)
    );
});

test('teacher can sync fresh data from penyaluran api via sync-penyaluran route', function () {
    $teacher = createGuruManagementTeacher([
        'penyaluran_id' => 400,
        'penyaluran_token' => 'teacher-token-400',
    ]);

    Http::fake([
        '*/api/v1/guru/me' => Http::response([
            'success' => true,
            'data' => [
                'id' => 400,
                'name' => 'Guru Updated Name',
                'code' => 'G-400',
                'kantor_name' => 'KANTOR CABANG SIDOARJO',
                'sanggars' => [
                    ['id' => 20, 'name' => 'Sanggar Maju', 'type' => 'Genius'],
                ],
                'students' => [
                    ['id' => 601, 'student_id' => 601, 'name' => 'Santri Baru', 'nik' => '3578000000000601', 'gender' => 'L', 'sanggar_id' => 20],
                ],
            ],
        ], 200),
        '*/api/v1/guru/sanggars' => Http::response([
            'success' => true,
            'data' => [
                ['id' => 20, 'name' => 'Sanggar Maju', 'type' => 'Genius', 'total_students' => 1],
            ],
        ], 200),
        '*/api/v1/guru/students*' => Http::response([
            'success' => true,
            'data' => [
                ['id' => 601, 'student_id' => 601, 'name' => 'Santri Baru', 'nik' => '3578000000000601', 'gender' => 'L', 'sanggar_id' => 20],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'teacher-token-400'])
        ->post(route('teacher.sync-penyaluran'));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($teacher->fresh()->name)->toBe('Guru Updated Name')
        ->and($teacher->fresh()->branch)->toBe('KANTOR CABANG SIDOARJO')
        ->and(session('penyaluran_me')['name'])->toBe('Guru Updated Name')
        ->and(count(session('penyaluran_students')))->toBe(1);
});


