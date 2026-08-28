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
        'age' => 14,
        'school_name' => 'SMP Negeri 2 Surabaya',
        'grade' => '8',
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
        ->get(route('admin.teacher.students.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teacher/students/create')
            ->has('olimpiades', 1)
            ->has('students', 1)
            ->where('students.0.id', $student->id)
            ->where('students.0.nik', $student->nik)
            ->where('students.0.full_name', $student->full_name)
            ->has('provinces')
            ->has('regencies')
        );
});

it('excludes students assigned to another teacher from the roster', function () {
    openRegistrationsOptions();
    $teacherA = createRegistrationOptionsTeacher();
    $teacherB = createRegistrationOptionsTeacher();

    $mine = createOptionsStudent($teacherA, '3525011505120002');
    createOptionsStudent($teacherB, '3525011505120003');

    $this->actingAs($teacherA)
        ->get(route('admin.teacher.students.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teacher/students/create')
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
        ->get(route('admin.teacher.students.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teacher/students/create')
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
        ->post(route('admin.teacher.students.store'), [
            'penyaluran_student_id' => $student->id,
            'olimpiade_id' => $olimpiade->id,
        ])
        ->assertRedirect(route('admin.teacher.students.index'))
        ->assertSessionHasNoErrors();

    $participant = Participant::first();

    expect($participant)->not->toBeNull()
        ->and($participant->penyaluran_student_id)->toBe($student->id)
        ->and($participant->mentor_id)->toBe($teacher->id);
});

it('preselects a valid roster student when student_id is passed', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();
    $student = createOptionsStudent($teacher, '3525011505120002');

    $this->actingAs($teacher)
        ->get(route('admin.teacher.students.create', ['student_id' => $student->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teacher/students/create')
            ->where('preselected_student_id', $student->id)
        );
});

it('ignores a student_id that is not part of the roster', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();
    $other = createRegistrationOptionsTeacher();
    $theirStudent = createOptionsStudent($other, '3525011505120002');

    $this->actingAs($teacher)
        ->get(route('admin.teacher.students.create', ['student_id' => $theirStudent->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teacher/students/create')
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
        ->get(route('admin.teacher.students.create', ['student_id' => $student->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teacher/students/create')
            ->has('students', 0)
            ->where('preselected_student_id', null)
        );
});

it('lists only the teacher roster with registration info in getData', function () {
    openRegistrationsOptions();
    $teacherA = createRegistrationOptionsTeacher();
    $teacherB = createRegistrationOptionsTeacher();

    $unregistered = createOptionsStudent($teacherA, '3525011505120002');
    $registered = createOptionsStudent($teacherA, '3525011505120003');
    $rejected = createOptionsStudent($teacherA, '3525011505120004');
    createOptionsStudent($teacherB, '3525011505120005');

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika']);

    Participant::create([
        'student_id' => $registered->id,
        'mentor_id' => $teacherA->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    Participant::create([
        'student_id' => $rejected->id,
        'mentor_id' => $teacherA->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0002',
        'registration_type' => 'teacher',
        'status' => 'rejected',
    ]);

    $this->actingAs($teacherA)
        ->get(route('admin.teacher.students.data'))
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('data.0.full_name', $unregistered->full_name)
        ->assertJsonPath('data.0.is_registered', false)
        ->assertJsonPath('data.1.registration_status', 'verified')
        ->assertJsonPath('data.1.olimpiade_name', 'Olimpiade Matematika')
        ->assertJsonPath('data.2.registration_status', 'rejected')
        ->assertJsonMissing(['data' => [['full_name' => 'Siti Aminah 05']]]);
});

it('filters getData by registration status', function () {
    openRegistrationsOptions();
    $teacher = createRegistrationOptionsTeacher();

    $unregistered = createOptionsStudent($teacher, '3525011505120002');
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
        ->get(route('admin.teacher.students.data', ['filterValue' => ['registration' => 'registered']]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $registered->id);

    $this->actingAs($teacher)
        ->get(route('admin.teacher.students.data', ['filterValue' => ['registration' => 'unregistered']]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $unregistered->id);
});
