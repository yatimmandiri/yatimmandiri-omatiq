<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\User;
use App\Services\TeacherService;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(UserRolePermissionSeeder::class);
});

use App\Models\Core\Region\District;
use App\Models\Core\Region\Village;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

test('public registration creates an isolated umum student', function () {
    Storage::fake('public');

    Cache::put('branch_offices', [
        ['id' => 1, 'name' => 'SURABAYA PUSAT'],
    ], 3600);

    $province = Province::create(['id' => '35', 'name' => 'JAWA TIMUR']);
    $regency = Regency::create(['id' => '3578', 'province_id' => '35', 'name' => 'KOTA SURABAYA']);
    $district = District::create(['id' => '3578010', 'regency_id' => '3578', 'name' => 'GUBENG']);
    $village = Village::create(['id' => '3578010001', 'district_id' => '3578010', 'name' => 'AIRLANGGA']);
    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026, 'status' => true]);

    $postData = [
        'name' => 'Ahmad Santoso',
        'email' => 'ahmad@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'nik' => '3578010101010001',
        'full_name' => 'Ahmad Santoso',
        'gender' => 'male',
        'birth_place' => 'Surabaya',
        'birth_date' => '2014-05-10',
        'school_name' => 'SD Negeri 1 Surabaya',
        'grade' => 'IV',
        'address' => 'Jl. Pemuda No. 1',
        'province_id' => '35',
        'regency_id' => '3578',
        'district_id' => '3578010',
        'village_id' => '3578010001',
        'parent_phone' => '081234567890',
        'referral_source' => 'Website',
        'olimpiade_id' => $olimpiade->id,
        'branch' => 'SURABAYA PUSAT',
        'payment_proof' => UploadedFile::fake()->image('bukti.jpg'),
        'student_card' => UploadedFile::fake()->image('kartu.jpg'),
        'data_truth_consent' => true,
        'documentation_consent' => true,
        'rules_consent' => true,
        'participant_signature_name' => 'Ahmad',
        'guardian_signature_name' => 'Santoso',
    ];

    $response = $this->post(route('home.registration.store'), $postData);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $student = Student::where('nik', '3578010101010001')->where('is_binaan', false)->first();
    expect($student)->not->toBeNull()
        ->and($student->is_binaan)->toBeFalse()
        ->and($student->mentor_id)->toBeNull()
        ->and($student->penyaluran_id)->toBeNull();
});

test('teacher registration creates a binaan student without colliding with umum student', function () {
    $teacher = User::factory()->create(['name' => 'Ustadz Fulan', 'email_verified_at' => now()]);
    $teacher->assignRole('Teacher');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);

    // Pre-existing umum student with same NIK
    $umumStudent = Student::factory()->create([
        'nik' => '3578010101010002',
        'full_name' => 'Santri Umum',
        'is_binaan' => false,
        'mentor_id' => null,
    ]);

    $service = app(TeacherService::class);

    $penyaluranStudent = [
        'student_id' => 99999,
        'nik' => '3578010101010002',
        'name' => 'Santri Binaan',
        'gender' => 'L',
        'school_name' => 'Sanggar Al-Huda',
        'class' => '4',
        'birth_date' => '2015-01-01',
        'address' => 'Surabaya',
        'guardian_phone' => '0899999999',
        'sanggar_id' => 10,
        'sanggar_name' => 'Sanggar Al-Huda',
        'kantor_name' => 'Surabaya',
    ];

    $participant = $service->registerStudent($teacher, [
        'olimpiade_id' => $olimpiade->id,
        'penyaluran_sanggar_id' => 10,
        'penyaluran_sanggar_name' => 'Sanggar Al-Huda',
    ], $penyaluranStudent);

    expect($participant)->toBeInstanceOf(Participant::class)
        ->and($participant->status)->toBe('verified');

    // Both student records exist independently without overwriting
    $binaanStudent = Student::where('penyaluran_id', 99999)->where('is_binaan', true)->first();
    expect($binaanStudent)->not->toBeNull()
        ->and($binaanStudent->full_name)->toBe('Santri Binaan')
        ->and($binaanStudent->mentor_id)->toBe($teacher->id);

    // Verify umum student was not altered
    $umumStudent->refresh();
    expect($umumStudent->is_binaan)->toBeFalse()
        ->and($umumStudent->mentor_id)->toBeNull()
        ->and($umumStudent->full_name)->toBe('Santri Umum');
});
