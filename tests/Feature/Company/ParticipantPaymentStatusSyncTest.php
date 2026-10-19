<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    Http::fake([
        '*/api/v1/*' => Http::response(['success' => true, 'data' => []], 200),
    ]);
    $this->seed(UserRolePermissionSeeder::class);
});

test('keuangan updating payment status to paid automatically verifies participant', function () {
    $keuangan = User::factory()->create([
        'name' => 'Staf Keuangan',
        'email_verified_at' => now(),
    ]);
    $keuangan->assignRole('Keuangan');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create(['full_name' => 'Budi Santoso']);
    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'submitted',
        'payment_status' => 'unpaid',
        'registration_type' => 'public',
    ]);

    $response = $this->actingAs($keuangan)->put(route('admin.companies.participants.status', $participant->id), [
        'payment_status' => 'paid',
    ]);

    $response->assertSessionHasNoErrors();
    $participant->refresh();
    expect($participant->payment_status)->toBe('paid')
        ->and($participant->status)->toBe('verified');
});

test('admin updating payment status to paid automatically verifies participant', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Pusat',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create(['full_name' => 'Ani Lestari']);
    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'submitted',
        'payment_status' => 'unpaid',
        'registration_type' => 'public',
    ]);

    $response = $this->actingAs($admin)->put(route('admin.companies.participants.status', $participant->id), [
        'payment_status' => 'paid',
    ]);

    $response->assertSessionHasNoErrors();
    $participant->refresh();
    expect($participant->payment_status)->toBe('paid')
        ->and($participant->status)->toBe('verified');
});

test('payment paid does not override rejected participant status', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Pusat',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create(['full_name' => 'Calon Diskualifikasi']);
    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'rejected',
        'payment_status' => 'waiting_confirmation',
        'registration_type' => 'public',
    ]);

    $response = $this->actingAs($admin)->put(route('admin.companies.participants.status', $participant->id), [
        'payment_status' => 'paid',
    ]);

    $response->assertSessionHasNoErrors();
    $participant->refresh();
    expect($participant->payment_status)->toBe('paid')
        ->and($participant->status)->toBe('rejected');
});

test('reverting payment to unpaid reverts verified public participant back to submitted', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Pusat',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create(['full_name' => 'Citra Dewi']);
    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'verified',
        'payment_status' => 'paid',
        'registration_type' => 'public',
    ]);

    $response = $this->actingAs($admin)->put(route('admin.companies.participants.status', $participant->id), [
        'payment_status' => 'unpaid',
    ]);

    $response->assertSessionHasNoErrors();
    $participant->refresh();
    expect($participant->payment_status)->toBe('unpaid')
        ->and($participant->status)->toBe('submitted');
});

test('admin can manually override status to rejected even when payment is paid', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Pusat',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $olimpiade = Olimpiade::factory()->create(['event_year' => 2026]);
    $student = Student::factory()->create(['full_name' => 'Doni Saputra']);
    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'status' => 'verified',
        'payment_status' => 'paid',
        'registration_type' => 'public',
    ]);

    $response = $this->actingAs($admin)->put(route('admin.companies.participants.status', $participant->id), [
        'status' => 'rejected',
        'notes' => 'Dokumen identitas tidak sah',
    ]);

    $response->assertSessionHasNoErrors();
    $participant->refresh();
    expect($participant->status)->toBe('rejected')
        ->and($participant->payment_status)->toBe('paid')
        ->and($participant->notes)->toBe('Dokumen identitas tidak sah');
});
