<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Permission;
use App\Models\Core\Role;
use App\Models\Core\User;
use App\Services\TeacherService;
use App\Settings\SiteSettings;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $settings = app(SiteSettings::class);
    $settings->registration_binaan_open = true;
    $settings->save();
});

function createIsolatedTeacher(string $name = 'Guru A', string $phone = '081234567801'): User
{
    $role = Role::firstOrCreate(['name' => 'Teacher']);

    foreach (['view-participant', 'create-participant', 'data-participant', 'delete-participant'] as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
    }

    $role->givePermissionTo(['view-participant', 'create-participant', 'data-participant', 'delete-participant']);

    $teacher = User::factory()->create([
        'name' => $name,
        'phone' => $phone,
    ]);
    $teacher->assignRole($role);

    return $teacher;
}

it('strictly isolates teacher data peserta list to the authenticated teacher', function () {
    $teacherA = createIsolatedTeacher('Guru A', '081234567801');
    $teacherB = createIsolatedTeacher('Guru B', '081234567802');

    $studentA = Student::create([
        'nik' => '3525011505120001',
        'full_name' => 'Santri Guru A',
        'gender' => 'male',
        'school_name' => 'SDN 1',
        'grade' => '4',
        'address' => 'Surabaya',
        'mentor_id' => $teacherA->id,
        'is_binaan' => true,
    ]);

    $studentB = Student::create([
        'nik' => '3525011505120002',
        'full_name' => 'Santri Guru B',
        'gender' => 'female',
        'school_name' => 'SDN 2',
        'grade' => '5',
        'address' => 'Sidoarjo',
        'mentor_id' => $teacherB->id,
        'is_binaan' => true,
    ]);

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika 2026',
        'category' => 'Matematika',
        'event_year' => 2026,
    ]);

    Participant::create([
        'student_id' => $studentA->id,
        'nik' => $studentA->nik,
        'mentor_id' => $teacherA->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-20260901-0001',
        'registration_type' => 'teacher',
        'status' => 'verified',
        'event_year' => 2026,
    ]);

    Participant::create([
        'student_id' => $studentB->id,
        'nik' => $studentB->nik,
        'mentor_id' => $teacherB->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-20260901-0002',
        'registration_type' => 'teacher',
        'status' => 'verified',
        'event_year' => 2026,
    ]);

    // Teacher A should only see Santri Guru A
    $responseA = $this->actingAs($teacherA)->getJson(route('teacher.data-peserta.data'));
    $responseA->assertOk();
    $dataA = $responseA->json('data');
    expect($dataA)->toHaveCount(1)
        ->and($dataA[0]['registration_number'])->toBe('OMQ-20260901-0001');

    // Teacher B should only see Santri Guru B
    $responseB = $this->actingAs($teacherB)->getJson(route('teacher.data-peserta.data'));
    $responseB->assertOk();
    $dataB = $responseB->json('data');
    expect($dataB)->toHaveCount(1)
        ->and($dataB[0]['registration_number'])->toBe('OMQ-20260901-0002');
});

it('rejects registering the same NIK to a different olimpiade in the same event year', function () {
    $teacher = createIsolatedTeacher();
    $student = Student::create([
        'nik' => '3525011505120003',
        'full_name' => 'Ahmad Santri',
        'gender' => 'male',
        'school_name' => 'SDN 1',
        'grade' => '4',
        'address' => 'Surabaya',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $olimpiadeMtk = Olimpiade::create([
        'name' => 'Olimpiade Matematika 2026',
        'category' => 'Matematika',
        'event_year' => 2026,
    ]);

    $olimpiadeQuran = Olimpiade::create([
        'name' => 'Olimpiade Al-Quran 2026',
        'category' => 'Al-Quran',
        'event_year' => 2026,
    ]);

    // First registration in Matematika
    $this->actingAs($teacher)
        ->post(route('teacher.data-peserta.store'), [
            'penyaluran_student_id' => $student->id,
            'olimpiade_id' => $olimpiadeMtk->id,
        ])
        ->assertRedirect(route('teacher.data-peserta.index'))
        ->assertSessionHasNoErrors();

    expect(Participant::count())->toBe(1);

    // Second registration attempt in Al-Quran with same student (same NIK, same year)
    $this->actingAs($teacher)
        ->post(route('teacher.data-peserta.store'), [
            'penyaluran_student_id' => $student->id,
            'olimpiade_id' => $olimpiadeQuran->id,
        ])
        ->assertSessionHasErrors('penyaluran_student_id');

    expect(Participant::count())->toBe(1);
});

it('redirects to data-binaan index if create page is visited without student_id', function () {
    $teacher = createIsolatedTeacher();

    $this->actingAs($teacher)
        ->get(route('teacher.data-peserta.create'))
        ->assertRedirect(route('teacher.data-binaan.index'))
        ->assertSessionHas('info', 'Silakan pilih santri yang ingin didaftarkan terlebih dahulu.');
});

it('redirects to data-binaan index with error if create page is visited for already registered student', function () {
    $teacher = createIsolatedTeacher();
    $student = Student::create([
        'nik' => '3525011505120004',
        'full_name' => 'Santri Terdaftar',
        'gender' => 'male',
        'school_name' => 'SDN 1',
        'grade' => '4',
        'address' => 'Surabaya',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade IPA 2026',
        'category' => 'IPA',
        'event_year' => 2026,
    ]);

    Participant::create([
        'student_id' => $student->id,
        'nik' => $student->nik,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-20260901-0003',
        'registration_type' => 'teacher',
        'status' => 'verified',
        'event_year' => 2026,
    ]);

    $this->actingAs($teacher)
        ->get(route('teacher.data-peserta.create', ['student_id' => $student->id]))
        ->assertRedirect(route('teacher.data-binaan.index'))
        ->assertSessionHas('error', 'Santri ini sudah terdaftar pada OMATIQ 2026.');
});

it('prevents TeacherService::getStudentById from returning another teacher participant', function () {
    $teacherA = createIsolatedTeacher('Guru A');
    $teacherB = createIsolatedTeacher('Guru B');

    $student = Student::create([
        'nik' => '3525011505120005',
        'full_name' => 'Santri A',
        'gender' => 'male',
        'school_name' => 'SDN 1',
        'grade' => '4',
        'address' => 'Surabaya',
        'mentor_id' => $teacherA->id,
        'is_binaan' => true,
    ]);

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika 2026',
        'category' => 'Matematika',
        'event_year' => 2026,
    ]);

    $participant = Participant::create([
        'student_id' => $student->id,
        'nik' => $student->nik,
        'mentor_id' => $teacherA->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-20260901-0004',
        'registration_type' => 'teacher',
        'status' => 'verified',
        'event_year' => 2026,
    ]);

    $service = app(TeacherService::class);

    // Teacher A can find it
    expect($service->getStudentById($teacherA, $participant->id)->id)->toBe($participant->id);

    // Teacher B cannot find it (throws ModelNotFoundException)
    $service->getStudentById($teacherB, $participant->id);
})->throws(ModelNotFoundException::class);

it('resets registration status in data binaan when teacher cancels a participant registration', function () {
    $teacher = createIsolatedTeacher();
    $student = Student::create([
        'nik' => '3525011505120006',
        'full_name' => 'Santri Batal',
        'gender' => 'male',
        'school_name' => 'SDN 1',
        'grade' => '4',
        'address' => 'Surabaya',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika 2026',
        'category' => 'Matematika',
        'event_year' => 2026,
    ]);

    // 1. Register student
    $this->actingAs($teacher)
        ->post(route('teacher.data-peserta.store'), [
            'penyaluran_student_id' => $student->id,
            'olimpiade_id' => $olimpiade->id,
        ])
        ->assertRedirect(route('teacher.data-peserta.index'));

    $participant = Participant::where('student_id', $student->id)->first();
    expect($participant)->not->toBeNull();

    // Verify Data Binaan shows is_registered true
    $resBefore = $this->actingAs($teacher)->getJson(route('teacher.data-binaan.data'));
    $resBefore->assertOk();
    $itemBefore = collect($resBefore->json('data'))->firstWhere('id', $student->id);
    expect($itemBefore['is_registered'])->toBeTrue()
        ->and($itemBefore['registration_status'])->toBe('verified')
        ->and($itemBefore['participant_id'])->toBe($participant->id);

    // 2. Teacher cancels registration (destroy)
    $this->actingAs($teacher)
        ->delete(route('teacher.data-peserta.destroy', $participant->id))
        ->assertRedirect(route('teacher.data-peserta.index'));

    expect(Participant::find($participant->id))->toBeNull();

    // 3. Verify Data Binaan resets to is_registered false
    $resAfter = $this->actingAs($teacher)->getJson(route('teacher.data-binaan.data'));
    $resAfter->assertOk();
    $itemAfter = collect($resAfter->json('data'))->firstWhere('id', $student->id);
    expect($itemAfter['is_registered'])->toBeFalse()
        ->and($itemAfter['registration_status'])->toBeNull()
        ->and($itemAfter['participant_id'])->toBeNull();
});

it('does not falsely match students with dash or empty NIK in data binaan', function () {
    $teacher = createIsolatedTeacher();
    $studentWithoutNik = Student::create([
        'nik' => '-',
        'full_name' => 'Santri No NIK',
        'gender' => 'female',
        'school_name' => 'SDN 1',
        'grade' => '3',
        'address' => 'Surabaya',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $otherStudent = Student::create([
        'nik' => '3525011505120007',
        'full_name' => 'Santri Lain',
        'gender' => 'male',
        'school_name' => 'SDN 2',
        'grade' => '4',
        'address' => 'Sidoarjo',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade IPA 2026',
        'category' => 'IPA',
        'event_year' => 2026,
    ]);

    // Register other student
    Participant::create([
        'student_id' => $otherStudent->id,
        'nik' => $otherStudent->nik,
        'mentor_id' => $teacher->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-20260901-0099',
        'registration_type' => 'teacher',
        'status' => 'verified',
        'event_year' => 2026,
    ]);

    $res = $this->actingAs($teacher)->getJson(route('teacher.data-binaan.data'));
    $res->assertOk();
    $itemNoNik = collect($res->json('data'))->firstWhere('id', $studentWithoutNik->id);

    // Santri without valid NIK must NOT be falsely marked as registered
    expect($itemNoNik['is_registered'])->toBeFalse()
        ->and($itemNoNik['participant_id'])->toBeNull();
});

it('strictly blocks duplicate NIK across public registration and teacher binaan registration', function () {
    $teacher = createIsolatedTeacher();
    $sharedNik = '3525011505120008';

    $olimpiadePublic = Olimpiade::create([
        'name' => 'Olimpiade Matematika 2026',
        'category' => 'Matematika',
        'event_year' => 2026,
    ]);

    $olimpiadeGuru = Olimpiade::create([
        'name' => 'Olimpiade IPA 2026',
        'category' => 'IPA',
        'event_year' => 2026,
    ]);

    // 1. Create a public participant with this NIK
    $studentUmum = Student::create([
        'nik' => $sharedNik,
        'full_name' => 'Siswa Umum',
        'gender' => 'male',
        'school_name' => 'SDN 1',
        'grade' => '4',
        'address' => 'Surabaya',
        'is_binaan' => false,
    ]);

    Participant::create([
        'student_id' => $studentUmum->id,
        'nik' => $sharedNik,
        'olimpiade_id' => $olimpiadePublic->id,
        'registration_number' => 'OMQ-20260901-0888',
        'registration_type' => 'public',
        'status' => 'submitted',
        'event_year' => 2026,
    ]);

    // 2. Teacher creates a binaan with the same NIK and tries to register to a different olimpiade
    $binaanStudent = Student::create([
        'nik' => $sharedNik,
        'full_name' => 'Siswa Binaan Guru',
        'gender' => 'male',
        'school_name' => 'SDN 1',
        'grade' => '4',
        'address' => 'Surabaya',
        'mentor_id' => $teacher->id,
        'is_binaan' => true,
    ]);

    $this->actingAs($teacher)
        ->post(route('teacher.data-peserta.store'), [
            'penyaluran_student_id' => $binaanStudent->id,
            'olimpiade_id' => $olimpiadeGuru->id,
        ])
        ->assertSessionHasErrors('penyaluran_student_id');

    expect(Participant::where('nik', $sharedNik)->count())->toBe(1);
});
