<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrators', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Cabang', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Keuangan', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Participant', 'guard_name' => 'web']);

    $this->admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $this->admin->assignRole('Administrators');

    $this->keuangan = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $this->keuangan->assignRole('Keuangan');

    $this->olimpiade = Olimpiade::factory()->create([
        'name' => 'Matematika SD',
        'category' => 'SD 1-2',
        'event_year' => 2026,
        'status' => true,
    ]);

    $this->student = Student::factory()->create([
        'full_name' => 'Santri Hebat',
        'nik' => '3578010101019999',
        'nis' => '88888',
        'school_name' => 'SD Teladan',
        'birth_date' => '2015-01-01',
        'school_level' => 'SD',
        'grade' => '3',
    ]);

    $this->participant = Participant::factory()->create([
        'student_id' => $this->student->id,
        'olimpiade_id' => $this->olimpiade->id,
        'event_year' => 2026,
        'registration_number' => 'OMQ-2026-TEST-SOC01',
        'status' => 'verified',
        'social_status' => 'yatim',
    ]);
});

test('admin can update participant social status via shortcut endpoint', function () {
    $response = $this->actingAs($this->admin)
        ->put(route('admin.companies.participants.social-status', $this->participant), [
            'social_status' => 'yatim_piatu',
        ]);

    $response->assertRedirect();
    $this->participant->refresh();
    expect($this->participant->social_status)->toBe('yatim_piatu')
        ->and($this->participant->social_status_color)->toBe('#c9fbfe');
});

test('admin can change social status to all valid variants', function (string $status, string $expectedColor) {
    $response = $this->actingAs($this->admin)
        ->put(route('admin.companies.participants.social-status', $this->participant), [
            'social_status' => $status,
        ]);

    $response->assertRedirect();
    $this->participant->refresh();
    expect($this->participant->social_status)->toBe($status)
        ->and($this->participant->social_status_color)->toBe($expectedColor);
})->with([
    ['yatim', '#09767a'],
    ['yatim_piatu', '#c9fbfe'],
    ['dhuafa', '#2e318d'],
    ['umum', '#ffde00'],
]);

test('validation rejects invalid social status', function () {
    $response = $this->actingAs($this->admin)
        ->put(route('admin.companies.participants.social-status', $this->participant), [
            'social_status' => 'invalid_status_xyz',
        ]);

    $response->assertSessionHasErrors(['social_status']);
    $this->participant->refresh();
    expect($this->participant->social_status)->toBe('yatim');
});

test('role keuangan cannot update participant social status', function () {
    $response = $this->actingAs($this->keuangan)
        ->put(route('admin.companies.participants.social-status', $this->participant), [
            'social_status' => 'dhuafa',
        ]);

    $response->assertForbidden();
    $this->participant->refresh();
    expect($this->participant->social_status)->toBe('yatim');
});
