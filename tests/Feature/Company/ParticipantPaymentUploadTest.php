<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
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

test('participant can upload/re-upload payment proof from student dashboard', function () {
    $studentUser = User::factory()->create([
        'name' => 'Santri Peserta',
        'email_verified_at' => now(),
    ]);
    $studentUser->assignRole('Participant');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create([
        'user_id' => $studentUser->id,
        'full_name' => 'Santri Peserta',
    ]);

    $oldProof = UploadedFile::fake()->image('old_proof.jpg')->store('participants/payment_proofs', 'public');

    $participant = Participant::factory()->create([
        'user_id' => $studentUser->id,
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'rejected',
        'notes' => 'Bukti transfer buram / salah nominal.',
        'payment_status' => 'unpaid',
        'payment_proof_path' => $oldProof,
    ]);

    $newFile = UploadedFile::fake()->image('bukti_baru.jpg');

    $response = $this->actingAs($studentUser)->post(route('student.payment-proof'), [
        'payment_proof' => $newFile,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success');

    $participant->refresh();

    // Pastikan status di-reset dari rejected ke submitted & payment_status ke waiting_confirmation
    expect($participant->status)->toBe('submitted')
        ->and($participant->payment_status)->toBe('waiting_confirmation')
        ->and($participant->payment_proof_path)->not->toBe($oldProof);

    Storage::disk('public')->assertExists($participant->payment_proof_path);
});

test('admin can update participant with new payment proof without argument type error', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Omatiq',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create(['full_name' => 'Peserta Mandiri']);

    $oldProof = UploadedFile::fake()->image('old_admin_proof.jpg')->store('participants/payment_proofs', 'public');

    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'rejected',
        'payment_status' => 'unpaid',
        'payment_proof_path' => $oldProof,
    ]);

    $newProof = UploadedFile::fake()->image('new_admin_proof.png');

    $response = $this->actingAs($admin)->put(route('admin.companies.participants.update', $participant->id), [
        'olimpiade_id' => $olimpiade->id,
        'full_name' => 'Peserta Mandiri Diperbarui',
        'nickname' => 'Peserta',
        'gender' => 'male',
        'birth_place' => 'Surabaya',
        'birth_date' => '2012-05-10',
        'school_name' => 'SD Negeri 1 Surabaya',
        'school_level' => 'SD',
        'grade' => '5',
        'address' => 'Jl. Pahlawan No. 1',
        'parent_phone' => '081234567890',
        'status' => 'submitted',
        'participant_signature_name' => 'Peserta Mandiri',
        'guardian_signature_name' => 'Wali Peserta',
        'payment_status' => 'waiting_confirmation',
        'payment_proof' => $newProof,
    ]);

    $response->assertSessionHasNoErrors();
    $participant->refresh();

    expect($participant->payment_proof_path)->not->toBe($oldProof);
    Storage::disk('public')->assertExists($participant->payment_proof_path);
});
