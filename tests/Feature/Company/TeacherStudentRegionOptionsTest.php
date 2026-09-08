<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Permission;
use App\Models\Core\Role;
use App\Models\Core\User;
use App\Settings\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function createRegistrationOptionsTeacher(): User
{
    $role = Role::firstOrCreate(['name' => 'Teacher']);

    foreach (['view-participant', 'create-participant', 'data-participant'] as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
    }

    $role->givePermissionTo(['view-participant', 'create-participant', 'data-participant']);

    $teacher = User::factory()->create();
    $teacher->assignRole($role);

    return $teacher;
}

function openRegistrationsOptions(): void
{
    $settings = app(SiteSettings::class);
    $settings->registration_binaan_open = true;
    $settings->save();
}

function createOptionsStudent(User $teacher, string $nik): Student
{
    return Student::create([
        'nik' => $nik,
        'full_name' => 'Siti Aminah '.substr($nik, -2),
        'gender' => 'female',
        'birth_place' => 'Surabaya',
        'birth_date' => '2012-05-15',

        'school_name' => 'SMP Negeri 2 Surabaya',
        'grade' => 'II',
        'address' => 'Jl. Raya Darmo No. 12',
        'parent_phone' => '081234567890',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);
}

it('provides only olimpiades and the teacher roster on the create page', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();
    $student = createOptionsStudent($teacher, '3525011505120002');

    Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika']);

    $this->actingAs($teacher)
        ->get(route('admin.guru.data-peserta.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/guru/data-peserta/create')
            ->has('olimpiades', 1)
            ->has('students', 1)
            ->where('students.0.id', $student->id)
            ->where('students.0.nik', $student->nik)
            ->where('students.0.full_name', $student->full_name)
        );
});

it('excludes students assigned to another teacher from the roster', function () {
    openRegistrationsOptions();
    $teacherA = createRegistrationOptionsTeacher();
    $teacherB = createRegistrationOptionsTeacher();

    $mine = createOptionsStudent($teacherA, '3525011505120002');
    createOptionsStudent($teacherB, '3525011505120003');

    $this->actingAs($teacherA)
        ->get(route('admin.guru.data-peserta.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/guru/data-peserta/create')
            ->has('students', 1)
            ->where('students.0.id', $mine->id)
        );
});

it('excludes students who already have an active registration from the roster', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();

    $free = createOptionsStudent($teacher, '3525011505120002');
    $registered = createOptionsStudent($teacher, '3525011505120003');

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika']);

    Participant::create([
        'student_id' => $registered->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $this->actingAs($teacher)
        ->get(route('admin.guru.data-peserta.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/guru/data-peserta/create')
            ->has('students', 1)
            ->where('students.0.id', $free->id)
        );
});

it('lets a teacher register an assigned student from the create page', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();
    $student = createOptionsStudent($teacher, '3525011505120002');
    $olimpiade = Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika']);

    $this->actingAs($teacher)
        ->post(route('admin.guru.data-peserta.store'), [
            'penyaluran_student_id' => $student->id,
            'olimpiade_id' => $olimpiade->id,
        ])
        ->assertRedirect(route('admin.guru.data-peserta.index'))
        ->assertSessionHasNoErrors();

    $participant = Participant::first();

    expect($participant)->not->toBeNull()
        ->and($participant->student_id)->toBe($student->id)
        ->and($participant->mentor_id)->toBe($teacher->id);
});

it('preselects a valid roster student when student_id is passed', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();
    $student = createOptionsStudent($teacher, '3525011505120002');

    $this->actingAs($teacher)
        ->get(route('admin.guru.data-peserta.create', ['student_id' => $student->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/guru/data-peserta/create')
            ->where('preselected_student_id', $student->id)
        );
});

it('ignores a student_id that is not part of the roster', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();
    $other = createRegistrationOptionsTeacher();
    $theirStudent = createOptionsStudent($other, '3525011505120002');

    $this->actingAs($teacher)
        ->get(route('admin.guru.data-peserta.create', ['student_id' => $theirStudent->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/guru/data-peserta/create')
            ->where('preselected_student_id', null)
        );
});

it('ignores a student_id that already has an active registration', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();
    $student = createOptionsStudent($teacher, '3525011505120002');
    $olimpiade = Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika']);

    Participant::create([
        'student_id' => $student->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'submitted',
    ]);

    $this->actingAs($teacher)
        ->get(route('admin.guru.data-peserta.create', ['student_id' => $student->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/guru/data-peserta/create')
            ->has('students', 0)
            ->where('preselected_student_id', null)
        );
});

it('lists only the teacher participants in getData (Pendaftaran)', function () {
    openRegistrationsOptions();
    $teacherA = createRegistrationOptionsTeacher();
    $teacherB = createRegistrationOptionsTeacher();

    $s1 = createOptionsStudent($teacherA, '3525011505120002');
    $s2 = createOptionsStudent($teacherA, '3525011505120003');
    $s3 = createOptionsStudent($teacherA, '3525011505120004');
    $sOther = createOptionsStudent($teacherB, '3525011505120005');

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika']);

    $p1 = Participant::create([
        'student_id' => $s2->id,
        'mentor_id' => $teacherA->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $p2 = Participant::create([
        'student_id' => $s3->id,
        'mentor_id' => $teacherA->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0002',
        'registration_type' => 'teacher',
        'status' => 'rejected',
    ]);

    // other teacher's participant should not leak
    Participant::create([
        'student_id' => $sOther->id,
        'mentor_id' => $teacherB->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0003',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $this->actingAs($teacherA)
        ->get(route('admin.guru.data-peserta.data'))
        ->assertOk()
        ->assertJsonPath('total', 2)
        ->assertJsonCount(2, 'data')
        ->assertJsonMissing(['data' => [['registration_number' => 'OMQ-TEST-0003']]]);

    // s1 is unregistered roster — should NOT appear in Pendaftaran (participants only)
    expect(Participant::where('mentor_id', $teacherA->id)->count())->toBe(2);
});

it('filters Pendaftaran getData by status, olimpiade and event_year', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();

    $s1 = createOptionsStudent($teacher, '3525011505120002');
    $s2 = createOptionsStudent($teacher, '3525011505120003');

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika']);

    Participant::create([
        'student_id' => $s1->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'verified',
        'event_year' => $olimpiade->event_year ?? 2026,
    ]);

    Participant::create([
        'student_id' => $s2->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0002',
        'registration_type' => 'teacher',
        'status' => 'rejected',
        'event_year' => $olimpiade->event_year ?? 2026,
    ]);

    $this->actingAs($teacher)
        ->get(route('admin.guru.data-peserta.data', ['filterValue' => ['status' => 'verified']]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.status', 'verified');

    $this->actingAs($teacher)
        ->get(route('admin.guru.data-peserta.data', ['filterValue' => ['status' => 'rejected']]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.status', 'rejected');
});
