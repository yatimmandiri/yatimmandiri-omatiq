<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Permission;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Role;
use App\Models\Core\User;
use App\Settings\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

function createTeacher(): User
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

function openBinaanRegistration(): void
{
    $settings = app(SiteSettings::class);
    $settings->registration_binaan_open = true;
    $settings->save();
}

function createAssignedStudent(User $teacher, string $nik = '3525011505120002'): Student
{
    return Student::create([
        'nik' => $nik,
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
}

function createOlimpiade(string $name = 'Olimpiade Matematika', string $category = 'Matematika'): Olimpiade
{
    return Olimpiade::create(['name' => $name, 'category' => $category]);
}

function registrationPayload(int $olimpiadeId, int $studentId): array
{
    return [
        'penyaluran_student_id' => $studentId,
        'olimpiade_id' => $olimpiadeId,
    ];
}

it('lets a teacher register an assigned binaan student', function () {
    openBinaanRegistration();
    $teacher = createTeacher();
    $student = createAssignedStudent($teacher);
    $olimpiade = createOlimpiade();

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.store'), registrationPayload($olimpiade->id, $student->id))
        ->assertRedirect(route('admin.teacher.students.index'))
        ->assertSessionHasNoErrors();

    $participant = Participant::first();

    expect($participant)->not->toBeNull()
        ->and($participant->penyaluran_student_id)->toBe($student->id)
        ->and($participant->mentor_id)->toBe($teacher->id)
        ->and($participant->registration_type)->toBe('teacher')
        ->and($participant->status)->toBe('submitted')
        ->and($participant->registration_number)->toStartWith('OMQ-');
});

it('prevents registering a student who already has an active registration', function () {
    openBinaanRegistration();
    $teacher = createTeacher();
    $student = createAssignedStudent($teacher);
    $olimpiade = createOlimpiade('Olimpiade IPA', 'IPA');

    Participant::create([
        'penyaluran_student_id' => $student->id,
        'penyaluran_student_name' => $student->full_name,
        'penyaluran_student_nik' => $student->nik,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $next = createOlimpiade('Olimpiade Al-Quran', 'Al-Quran');

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.store'), registrationPayload($next->id, $student->id))
        ->assertSessionHasErrors('penyaluran_student_id');

    expect(Participant::count())->toBe(1);
});

it('prevents a teacher from registering another teacher student', function () {
    openBinaanRegistration();
    $teacherA = createTeacher();
    $teacherB = createTeacher();
    $student = createAssignedStudent($teacherA);
    $olimpiade = createOlimpiade();

    $this->actingAs($teacherB)
        ->post(route('admin.teacher.students.store'), registrationPayload($olimpiade->id, $student->id))
        ->assertSessionHasErrors('penyaluran_student_id');

    expect(Participant::count())->toBe(0);
});

it('lets a teacher re-register a student whose previous registration was rejected', function () {
    openBinaanRegistration();
    $teacher = createTeacher();
    $student = createAssignedStudent($teacher);

    $previous = createOlimpiade('Olimpiade IPA', 'IPA');

    Participant::create([
        'penyaluran_student_id' => $student->id,
        'penyaluran_student_name' => $student->full_name,
        'penyaluran_student_nik' => $student->nik,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $previous->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'rejected',
    ]);

    $next = createOlimpiade('Olimpiade Matematika', 'Matematika');

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.store'), registrationPayload($next->id, $student->id))
        ->assertRedirect(route('admin.teacher.students.index'))
        ->assertSessionHasNoErrors();

    expect(Participant::where('penyaluran_student_id', $student->id)->count())->toBe(2);
});

it('blocks public registration when the NIK already has an active registration', function () {
    openBinaanRegistration();
    $teacher = createTeacher();
    $student = createAssignedStudent($teacher);
    $olimpiade = createOlimpiade();

    // ensure regions exist for public registration validation
    if (! Province::where('id', '35')->exists()) {
        $province = new Province;
        $province->id = '35';
        $province->name = 'JAWA TIMUR';
        $province->save();
    }
    if (! Regency::where('id', '3578')->exists()) {
        $regency = new Regency;
        $regency->id = '3578';
        $regency->province_id = '35';
        $regency->name = 'KOTA SURABAYA';
        $regency->save();
    }

    Participant::create([
        'penyaluran_student_id' => $student->id,
        'penyaluran_student_name' => $student->full_name,
        'penyaluran_student_nik' => $student->nik,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);

    $this->post(route('home.registration.store'), [
        'nik' => $student->nik,
        'olimpiade_id' => $olimpiade->id,
        'full_name' => 'Siti Aminah',
        'nickname' => 'Siti',
        'gender' => 'female',
        'birth_place' => 'Surabaya',
        'birth_date' => '2012-05-15',
        'age' => 14,
        'school_name' => 'SMP Negeri 2 Surabaya',
        'grade' => '8',
        'address' => 'Jl. Raya Darmo No. 12',
        'province_id' => '35',
        'regency_id' => '3578',
        'parent_phone' => '081234567890',
        'referral_source' => 'Sekolah',
        'branch' => 'Surabaya',
        'payment_proof' => UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf'),
        'student_card' => UploadedFile::fake()->create('kartu.pdf', 100, 'application/pdf'),
        'data_truth_consent' => true,
        'documentation_consent' => true,
        'rules_consent' => true,
        'participant_signature_name' => 'Siti Aminah',
        'guardian_signature_name' => 'Ahmad',
        'email' => 'siti-aminah@example.com',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
    ])->assertSessionHasErrors('nik');

    expect(Student::where('nik', $student->nik)->count())->toBe(1)
        ->and(Participant::count())->toBe(1);
});

it('does not expose edit, update, or destroy routes to teachers', function () {
    openBinaanRegistration();
    $teacher = createTeacher();
    $student = createAssignedStudent($teacher);
    $olimpiade = createOlimpiade();

    $participant = Participant::create([
        'penyaluran_student_id' => $student->id,
        'penyaluran_student_name' => $student->full_name,
        'penyaluran_student_nik' => $student->nik,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'submitted',
    ]);

    $this->actingAs($teacher)
        ->get('/admin/teacher/students/'.$participant->id.'/edit')
        ->assertNotFound();

    $this->actingAs($teacher)
        ->put('/admin/teacher/students/'.$participant->id, ['olimpiade_id' => $olimpiade->id])
        ->assertMethodNotAllowed();

    $this->actingAs($teacher)
        ->delete('/admin/teacher/students/'.$participant->id)
        ->assertMethodNotAllowed();
});
