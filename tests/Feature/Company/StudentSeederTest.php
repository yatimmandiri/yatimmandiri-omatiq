<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Role;
use App\Models\Core\User;
use Database\Seeders\ParticipantSeeder;
use Database\Seeders\StudentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createStudentSeedTeacher(): User
{
    $role = Role::firstOrCreate(['name' => 'Teacher']);

    $teacher = User::factory()->create(['name' => 'Guru Pembimbing']);
    $teacher->assignRole($role);

    return $teacher;
}

function createStudentSeedRegion(): void
{
    $province = new Province;
    $province->id = '35';
    $province->name = 'JAWA TIMUR';
    $province->save();

    $regency = new Regency;
    $regency->id = '3578';
    $regency->province_id = '35';
    $regency->name = 'KOTA SURABAYA';
    $regency->save();
}

it('seeds students linked to existing teacher mentors', function () {
    $teacher = createStudentSeedTeacher();
    createStudentSeedRegion();

    $this->seed(StudentSeeder::class);

    expect(Student::count())->toBe(5);
    expect(Student::where('mentor_id', $teacher->id)->count())->toBe(5);

    $student = Student::where('nik', '3525011505120001')->first();

    expect($student->mentor_id)->toBe($teacher->id)
        ->and($student->mentor_name)->toBe('Guru Pembimbing')
        ->and($student->is_binaan)->toBeTrue()
        ->and($student->province_id)->toBe('35')
        ->and($student->regency_id)->toBe('3578');
});

it('seeds a participant referencing the student from StudentSeeder', function () {
    $teacher = createStudentSeedTeacher();
    createStudentSeedRegion();

    Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
    ]);

    $this->seed(StudentSeeder::class);
    $this->seed(ParticipantSeeder::class);

    expect(Participant::count())->toBe(1);

    $participant = Participant::first();

    $name = $participant->penyaluran_student_name ?? $participant->student?->full_name;
    expect($name)->toBe('RACHMA TALITA AZALIA')
        ->and($participant->mentor_id)->toBe($teacher->id)
        ->and($participant->registration_type)->toBe('teacher')
        ->and($participant->status)->toBe('verified');
});
