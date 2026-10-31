<?php

use App\Models\Company\NationalParticipant;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Settings\SiteSettings;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    Http::fake([
        '*/api/v1/*' => Http::response(['success' => true, 'data' => []], 200),
    ]);
    $this->seed(UserRolePermissionSeeder::class);
});

test('teacher can qualify and disqualify binaan student to national stage', function () {
    $teacherUser = User::factory()->create([
        'name' => 'Guru Pembimbing',
        'email_verified_at' => now(),
    ]);
    $teacherUser->assignRole('Teacher');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create([
        'mentor_id' => $teacherUser->id,
        'full_name' => 'Santri Binaan',
        'is_binaan' => true,
    ]);

    $participant = Participant::factory()->create([
        'mentor_id' => $teacherUser->id,
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'verified',
        'registration_type' => 'teacher',
    ]);

    // 1. Qualify to national
    $response = $this->actingAs($teacherUser)
        ->post(route('teacher.data-peserta.national-qualify', $participant->id));

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success');

    $participant->refresh();
    expect($participant->national)->not->toBeNull()
        ->and($participant->national->status)->toBe('unconfirmed');

    // 2. Disqualify (toggle off)
    $response = $this->actingAs($teacherUser)
        ->post(route('teacher.data-peserta.national-qualify', $participant->id));

    $response->assertSessionHasNoErrors();
    $participant->refresh();
    expect($participant->national)->toBeNull();

    // 3. Re-qualify (should restore soft-deleted row without error 1062)
    $response = $this->actingAs($teacherUser)
        ->post(route('teacher.data-peserta.national-qualify', $participant->id));

    $response->assertSessionHasNoErrors();
    $participant->refresh();
    expect($participant->national)->not->toBeNull()
        ->and($participant->national->status)->toBe('unconfirmed');
});

test('admin can qualify, cancel qualification, and re-qualify participant without constraint violation', function () {
    $adminUser = User::factory()->create(['email_verified_at' => now()]);
    $adminUser->assignRole('Administrators');

    $student = Student::factory()->create(['full_name' => 'Peserta Uji']);
    $participant = Participant::factory()->create(['student_id' => $student->id, 'status' => 'verified']);

    // 1. Qualify
    $this->actingAs($adminUser)->post(route('admin.companies.participants.national-qualify', $participant->id));
    $participant->refresh();
    expect($participant->national)->not->toBeNull();

    // 2. Cancel qualification (soft-deleted)
    $this->actingAs($adminUser)->post(route('admin.companies.participants.national-qualify', $participant->id));
    $participant->refresh();
    expect($participant->national)->toBeNull();

    // 3. Re-qualify (should restore without error 1062)
    $response = $this->actingAs($adminUser)->post(route('admin.companies.participants.national-qualify', $participant->id));
    $response->assertSessionHasNoErrors();
    $participant->refresh();
    expect($participant->national)->not->toBeNull()
        ->and($participant->national->status)->toBe('unconfirmed');
});

test('santri binaan uploads availability letter and is auto-verified with free fee', function () {
    $studentUser = User::factory()->create([
        'name' => 'Santri Peserta',
        'email_verified_at' => now(),
    ]);
    $studentUser->assignRole('Participant');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create([
        'user_id' => $studentUser->id,
        'full_name' => 'Santri Peserta Binaan',
        'is_binaan' => true,
    ]);

    $participant = Participant::factory()->create([
        'user_id' => $studentUser->id,
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'verified',
    ]);

    // Qualify to national
    NationalParticipant::create([
        'participant_id' => $participant->id,
        'qualified_by' => 1,
        'qualified_at' => now(),
        'status' => 'unconfirmed',
        'payment_status' => 'unpaid',
    ]);

    $letter = UploadedFile::fake()->create('surat_kesediaan.pdf', 500, 'application/pdf');

    $response = $this->actingAs($studentUser)->post(route('student.national-re-registration'), [
        'availability_letter' => $letter,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success');

    $participant->refresh();
    expect($participant->national->status)->toBe('verified')
        ->and($participant->national->payment_status)->toBe('paid')
        ->and($participant->national->availability_letter_path)->not->toBeNull();

    Storage::disk('public')->assertExists($participant->national->availability_letter_path);
});

test('public participant requires payment proof and availability letter, set to waiting confirmation', function () {
    $studentUser = User::factory()->create([
        'name' => 'Peserta Umum',
        'email_verified_at' => now(),
    ]);
    $studentUser->assignRole('Participant');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create([
        'user_id' => $studentUser->id,
        'full_name' => 'Peserta Umum Nasional',
        'is_binaan' => false,
    ]);

    $participant = Participant::factory()->create([
        'user_id' => $studentUser->id,
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'verified',
    ]);

    // Qualify
    NationalParticipant::create([
        'participant_id' => $participant->id,
        'qualified_by' => 1,
        'qualified_at' => now(),
        'status' => 'unconfirmed',
        'payment_status' => 'unpaid',
    ]);

    // 1. Missing payment proof -> validation error
    $letter = UploadedFile::fake()->create('surat_kesediaan.pdf', 500, 'application/pdf');
    $response = $this->actingAs($studentUser)->post(route('student.national-re-registration'), [
        'availability_letter' => $letter,
    ]);
    $response->assertSessionHasErrors(['national_payment_proof']);

    // 2. Complete upload
    $proof = UploadedFile::fake()->image('transfer_nasional.jpg');
    $response = $this->actingAs($studentUser)->post(route('student.national-re-registration'), [
        'availability_letter' => $letter,
        'national_payment_proof' => $proof,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success');

    $participant->refresh();
    expect($participant->national->status)->toBe('waiting_confirmation')
        ->and($participant->national->payment_status)->toBe('waiting_confirmation')
        ->and($participant->national->payment_proof_path)->not->toBeNull();

    Storage::disk('public')->assertExists($participant->national->payment_proof_path);
});

test('admin can verify public participant national documents and activate national card', function () {
    $adminUser = User::factory()->create([
        'name' => 'Super Admin',
        'email_verified_at' => now(),
    ]);
    $adminUser->assignRole('Administrators');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create([
        'full_name' => 'Peserta Umum Finalis',
        'is_binaan' => false,
    ]);

    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'verified',
    ]);

    $national = NationalParticipant::create([
        'participant_id' => $participant->id,
        'qualified_by' => $adminUser->id,
        'qualified_at' => now(),
        'status' => 'waiting_confirmation',
        'payment_status' => 'waiting_confirmation',
    ]);

    $response = $this->actingAs($adminUser)->post(route('admin.companies.participants.national-verify', $participant->id), [
        'status' => 'verified',
        'payment_status' => 'paid',
    ]);

    $response->assertSessionHasNoErrors();
    $participant->refresh();
    expect($participant->national->status)->toBe('verified')
        ->and($participant->national->payment_status)->toBe('paid');

    // Check national card endpoint with ?stage=national
    $cardResponse = $this->get(route('home.registration.card', [
        'registrationNumber' => $participant->registration_number,
        'stage' => 'national',
    ]));
    $cardResponse->assertOk();
    $cardResponse->assertSee('BABAK FINAL NASIONAL');
});

test('national re-registration is blocked when setting registration_national_open is disabled', function () {
    $settings = app(SiteSettings::class);
    $settings->registration_national_open = false;
    $settings->save();

    $studentUser = User::factory()->create(['email_verified_at' => now()]);
    $studentUser->assignRole('Participant');

    $student = Student::factory()->create(['user_id' => $studentUser->id, 'is_binaan' => true]);
    $participant = Participant::factory()->create(['user_id' => $studentUser->id, 'student_id' => $student->id]);

    NationalParticipant::create([
        'participant_id' => $participant->id,
        'qualified_by' => 1,
        'status' => 'unconfirmed',
    ]);

    $letter = UploadedFile::fake()->create('surat.pdf', 300, 'application/pdf');

    $response = $this->actingAs($studentUser)->post(route('student.national-re-registration'), [
        'availability_letter' => $letter,
    ]);

    $response->assertSessionHasErrors(['availability_letter']);

    // Restore setting
    $settings->registration_national_open = true;
    $settings->save();
});

test('branch admin can decline national participation for santri binaan with category and reason', function () {
    $cabangUser = User::factory()->create([
        'name' => 'Admin Cabang Surabaya',
        'email_verified_at' => now(),
        'branch' => 'Surabaya',
    ]);
    $cabangUser->assignRole('Cabang');

    $student = Student::factory()->create([
        'full_name' => 'Santri Binaan Cabang',
        'is_binaan' => true,
    ]);

    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'branch' => 'Surabaya',
        'status' => 'verified',
    ]);

    NationalParticipant::create([
        'participant_id' => $participant->id,
        'qualified_by' => 1,
        'status' => 'unconfirmed',
    ]);

    $response = $this->actingAs($cabangUser)->post(
        route('admin.companies.participants.national-decline-binaan', $participant->id),
        [
            'decline_category' => 'Urgensi / Musibah Keluarga',
            'decline_reason' => 'Santri ada keperluan keluarga mendadak di luar kota.',
        ]
    );

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success');

    $participant->refresh();
    expect($participant->national->status)->toBe('declined')
        ->and($participant->national->decline_category)->toBe('Urgensi / Musibah Keluarga')
        ->and($participant->national->decline_reason)->toBe('Santri ada keperluan keluarga mendadak di luar kota.')
        ->and($participant->national->declined_at)->not->toBeNull();
});

test('student can decline national stage with category and reason', function () {
    $studentUser = User::factory()->create([
        'name' => 'Peserta Umum',
        'email_verified_at' => now(),
    ]);
    $studentUser->assignRole('Participant');

    $student = Student::factory()->create([
        'user_id' => $studentUser->id,
        'full_name' => 'Peserta Mundur',
        'is_binaan' => false,
    ]);

    $participant = Participant::factory()->create([
        'user_id' => $studentUser->id,
        'student_id' => $student->id,
        'status' => 'verified',
    ]);

    NationalParticipant::create([
        'participant_id' => $participant->id,
        'qualified_by' => 1,
        'status' => 'unconfirmed',
    ]);

    $response = $this->actingAs($studentUser)->post(
        route('student.national-decline'),
        [
            'decline_category' => 'Jadwal Sekolah / Ujian Bentrok',
            'decline_reason' => 'Bersamaan dengan ujian akhir semester di sekolah.',
        ]
    );

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success');

    $participant->refresh();
    expect($participant->national->status)->toBe('declined')
        ->and($participant->national->decline_category)->toBe('Jadwal Sekolah / Ujian Bentrok')
        ->and($participant->national->decline_reason)->toBe('Bersamaan dengan ujian akhir semester di sekolah.')
        ->and($participant->national->declined_at)->not->toBeNull();
});

test('admin can reset declined national status back to unconfirmed', function () {
    $adminUser = User::factory()->create([
        'name' => 'Super Admin',
        'email_verified_at' => now(),
    ]);
    $adminUser->assignRole('Administrators');

    $student = Student::factory()->create([
        'full_name' => 'Peserta Batal Mundur',
        'is_binaan' => false,
    ]);

    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'status' => 'verified',
    ]);

    $national = NationalParticipant::create([
        'participant_id' => $participant->id,
        'qualified_by' => $adminUser->id,
        'status' => 'declined',
        'decline_category' => 'Lainnya',
        'decline_reason' => 'Salah klik informasi.',
        'declined_at' => now(),
    ]);

    $response = $this->actingAs($adminUser)->post(
        route('admin.companies.participants.national-verify', $participant->id),
        [
            'status' => 'unconfirmed',
        ]
    );

    $response->assertSessionHasNoErrors();

    $participant->refresh();
    expect($participant->national->status)->toBe('unconfirmed')
        ->and($participant->national->decline_category)->toBeNull()
        ->and($participant->national->decline_reason)->toBeNull()
        ->and($participant->national->declined_at)->toBeNull();
});
