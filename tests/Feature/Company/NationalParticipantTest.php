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
