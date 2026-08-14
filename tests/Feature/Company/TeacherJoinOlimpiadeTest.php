<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Permission;
use App\Models\Core\Role;
use App\Models\Core\User;
use App\Settings\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

function createTeacher(): User
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

function createBinaanStudent(User $teacher, string $nik = '3525011505120002'): Participant
{
    $olimpiade = Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika']);

    $student = Student::create([
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

    return Participant::create([
        'student_id' => $student->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'verified',
    ]);
}

function registrationPayload(int $olimpiadeId, string $nik): array
{
    $now = now();
    DB::table('provinces')->insertOrIgnore(['id' => '35', 'name' => 'Jawa Timur', 'created_at' => $now, 'updated_at' => $now]);
    DB::table('regencies')->insertOrIgnore(['id' => '3578', 'province_id' => '35', 'name' => 'Kota Surabaya', 'created_at' => $now, 'updated_at' => $now]);

    return [
        'nik' => $nik,
        'olimpiade_id' => $olimpiadeId,
        'full_name' => 'Siti Aminah',
        'nickname' => null,
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
        'mentor_name' => null,
        'mentor_phone' => null,
        'photo' => UploadedFile::fake()->image('photo.jpg'),
        'identity_card' => UploadedFile::fake()->create('ktp.pdf', 100, 'application/pdf'),
        'family_card' => UploadedFile::fake()->create('kk.pdf', 100, 'application/pdf'),
    ];
}

it('lets a teacher register a binaan student with a single olimpiade', function () {
    openBinaanRegistration();
    $teacher = createTeacher();
    $olimpiade = Olimpiade::create(['name' => 'Olimpiade IPA', 'category' => 'IPA']);

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.store'), registrationPayload($olimpiade->id, '3525010505120002'))
        ->assertRedirect(route('admin.teacher.students.index'))
        ->assertSessionHasNoErrors();

    expect(Student::where('nik', '3525010505120002')->count())->toBe(1)
        ->and(Participant::count())->toBe(1);
});

it('prevents registering the same student (NIK) to another olimpiade', function () {
    openBinaanRegistration();
    $teacher = createTeacher();
    $participant = createBinaanStudent($teacher);

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade Al-Quran', 'category' => 'Al-Quran']);

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.store'), registrationPayload($olimpiade->id, $participant->student->nik))
        ->assertSessionHasErrors('nik');

    expect(Student::where('nik', $participant->student->nik)->count())->toBe(1)
        ->and(Participant::where('student_id', $participant->student_id)->count())->toBe(1);
});

it('prevents a teacher from registering another teacher student', function () {
    openBinaanRegistration();
    $teacherA = createTeacher();
    $teacherB = createTeacher();
    $participant = createBinaanStudent($teacherA);

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade IPA', 'category' => 'IPA']);

    $this->actingAs($teacherB)
        ->put(route('admin.teacher.students.update', $participant), registrationPayload($olimpiade->id, $participant->student->nik))
        ->assertForbidden();
});

it('lets a teacher re-register a binaan student whose previous registration was rejected', function () {
    openBinaanRegistration();
    $teacher = createTeacher();

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

    $previous = Olimpiade::create(['name' => 'Olimpiade IPA', 'category' => 'IPA']);

    Participant::create([
        'student_id' => $student->id,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $previous->id,
        'registration_number' => 'OMQ-TEST-0001',
        'registration_type' => 'teacher',
        'status' => 'rejected',
    ]);

    $next = Olimpiade::create(['name' => 'Olimpiade Matematika', 'category' => 'Matematika']);

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.store'), registrationPayload($next->id, $student->nik))
        ->assertRedirect(route('admin.teacher.students.index'))
        ->assertSessionHasNoErrors();

    expect(Student::where('nik', $student->nik)->count())->toBe(1)
        ->and(Participant::where('student_id', $student->id)->count())->toBe(2);
});

it('lets a teacher register a student with the same NIK after the previous one was soft-deleted', function () {
    openBinaanRegistration();
    $teacher = createTeacher();

    $student = Student::create([
        'nik' => '3525010101010001',
        'full_name' => 'Ahmad Fauzi',
        'gender' => 'male',
        'birth_place' => 'Surabaya',
        'birth_date' => '2011-03-10',
        'age' => 15,
        'school_name' => 'SMP Negeri 5 Surabaya',
        'grade' => '9',
        'address' => 'Jl. Kertajaya No. 7',
        'parent_phone' => '085712345678',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $student->delete();

    $olimpiade = Olimpiade::create(['name' => 'Olimpiade IPA', 'category' => 'IPA']);

    $this->actingAs($teacher)
        ->post(route('admin.teacher.students.store'), registrationPayload($olimpiade->id, '3525010101010001'))
        ->assertRedirect(route('admin.teacher.students.index'))
        ->assertSessionHasNoErrors();

    expect(Student::withoutTrashed()->where('nik', '3525010101010001')->count())->toBe(1)
        ->and(Student::withTrashed()->where('nik', '3525010101010001')->count())->toBe(2)
        ->and(Participant::count())->toBe(1);
});

it('blocks public registration when the NIK already has an active registration', function () {
    openBinaanRegistration();
    $teacher = createTeacher();
    $participant = createBinaanStudent($teacher, '3525011505120002');

    $payload = registrationPayload($participant->olimpiade_id, '3525011505120002');
    $payload = array_merge($payload, [
        'referral_source' => 'Sekolah',
        'referral_source_other' => null,
        'data_truth_consent' => true,
        'documentation_consent' => true,
        'rules_consent' => true,
        'participant_signature_name' => 'Siti Aminah',
        'guardian_signature_name' => 'Ahmad',
        'email' => 'siti-aminah@example.com',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
    ]);

    $this->post(route('home.registration.store'), $payload)
        ->assertSessionHasErrors('nik');

    expect(Student::where('nik', '3525011505120002')->count())->toBe(1)
        ->and(Participant::count())->toBe(1);
});
