<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Permission;
use App\Models\Core\Role;
use App\Models\Core\User;
use App\Settings\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createJoinOlimpiadeTeacher(): User
{
    $role = Role::firstOrCreate(['name' => 'Teacher']);

    foreach (['view-participant', 'create-participant', 'update-participant', 'data-participant'] as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
    }

    $role->givePermissionTo(['view-participant', 'create-participant', 'update-participant', 'data-participant']);

    $teacher = User::factory()->create();
    $teacher->assignRole($role);

    return $teacher;
}

function openBinaanRegistration(): void
{
    $settings = app(SiteSettings::class);
    $settings->registration_binaan_open = true;
    $settings->save();
}

function createJoinOlimpiadeStudent(User $teacher): Participant
{
    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
    ]);

    $student = Student::create([
        'nik' => '3525011505120002',
        'full_name' => 'Siti Aminah',
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

    return Participant::create([
        'student_id' => $student->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);
}

it('lets a teacher register an existing student to another competition', function () {
    openBinaanRegistration();
    $teacher = createJoinOlimpiadeTeacher();
    $participant = createJoinOlimpiadeStudent($teacher);

    $alquran = Olimpiade::create([
        'name' => 'Olimpiade Al-Quran',
        'category' => 'Al-Quran',
    ]);

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.join-olimpiade', $participant), [
            'olimpiade_id' => $alquran->id,
        ])
        ->assertRedirect(route('admin.teacher.students.index'))
        ->assertSessionHasNoErrors();

    $newParticipant = Participant::query()
        ->where('student_id', $participant->student_id)
        ->where('olimpiade_id', $alquran->id)
        ->first();

    expect($newParticipant)
        ->not->toBeNull()
        ->mentor_id->toBe($teacher->id)
        ->registration_type->toBe('teacher')
        ->status->toBe('submitted');
});

it('prevents registering the same student to the same competition twice', function () {
    openBinaanRegistration();
    $teacher = createJoinOlimpiadeTeacher();
    $participant = createJoinOlimpiadeStudent($teacher);

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.join-olimpiade', $participant), [
            'olimpiade_id' => $participant->olimpiade_id,
        ])
        ->assertSessionHasErrors('olimpiade_id');

    expect(Participant::count())->toBe(1);
});

it('prevents a teacher from registering another teacher student', function () {
    openBinaanRegistration();
    $teacherA = createJoinOlimpiadeTeacher();
    $teacherB = createJoinOlimpiadeTeacher();
    $participant = createJoinOlimpiadeStudent($teacherA);

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade IPA',
        'category' => 'IPA',
    ]);

    $this->actingAs($teacherB)
        ->post(route('admin.teacher.students.join-olimpiade', $participant), [
            'olimpiade_id' => $olimpiade->id,
        ])
        ->assertForbidden();
});
