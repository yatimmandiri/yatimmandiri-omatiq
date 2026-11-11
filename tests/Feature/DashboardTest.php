<?php

use App\Models\Company\NationalParticipant;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('admin.dashboard'));
    $response->assertRedirect(route('admin.login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('admin.dashboard'));
    $response->assertOk();
});

test('keuangan role user gets dedicated keuangan dashboard', function () {
    Role::findOrCreate('Keuangan', 'web');
    $user = User::factory()->create();
    $user->assignRole('Keuangan');
    $this->actingAs($user);

    $response = $this->get(route('admin.dashboard'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/dashboard/admin')
        ->where('pageTitle', 'Dashboard Keuangan')
        ->where('isKeuangan', true)
        ->has('paidCount')
        ->has('waitingConfirmationCount')
        ->has('unpaidCount')
        ->has('totalNationalUmumCount')
        ->has('nationalUmumWaitingCount')
        ->has('nationalUmumVerifiedCount')
        ->has('nationalUmumList')
    );
});

test('keuangan can verify public national participant and mark as paid via shortcut', function () {
    Role::findOrCreate('Keuangan', 'web');
    $keuangan = User::factory()->create();
    $keuangan->assignRole('Keuangan');

    $student = Student::factory()->create(['full_name' => 'Peserta Umum Finalis']);
    $participant = Participant::factory()->create([
        'student_id' => $student->id,
        'registration_type' => 'public',
        'status' => 'verified',
    ]);

    $national = NationalParticipant::create([
        'participant_id' => $participant->id,
        'qualified_by' => $keuangan->id,
        'qualified_at' => now(),
        'status' => 'waiting_confirmation',
        'payment_status' => 'waiting_confirmation',
        'payment_proof_path' => 'national/payment_proofs/test.jpg',
    ]);

    $response = $this->actingAs($keuangan)->post(route('admin.companies.participants.national-verify', $participant->id), [
        'status' => 'verified',
        'payment_status' => 'paid',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success');

    $national->refresh();
    expect($national->status)->toBe('verified')
        ->and($national->payment_status)->toBe('paid')
        ->and($national->registered_at)->not->toBeNull();
});
