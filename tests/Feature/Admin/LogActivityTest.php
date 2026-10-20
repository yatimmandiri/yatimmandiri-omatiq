<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Core\LogActivity;
use App\Models\Core\User;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(UserRolePermissionSeeder::class);
    LogActivity::query()->delete();
});

test('only administrators can access log activities', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Utama',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $teacher = User::factory()->create([
        'name' => 'Guru Sanggar',
        'email_verified_at' => now(),
    ]);
    $teacher->assignRole('Teacher');

    // Admin can access
    $this->actingAs($admin)
        ->get(route('admin.logs.activities.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.logs.activities.data'))
        ->assertOk();

    // Teacher is forbidden
    $this->actingAs($teacher)
        ->get(route('admin.logs.activities.index'))
        ->assertForbidden();

    $this->actingAs($teacher)
        ->get(route('admin.logs.activities.data'))
        ->assertForbidden();
});

test('log activity table defaults to sorting by newest first', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Utama',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');
    LogActivity::query()->delete();

    // Buat log dengan urutan waktu
    $logOld = LogActivity::create([
        'log_name' => 'System',
        'description' => 'Log Lama',
        'event' => 'created',
        'subject_type' => Olimpiade::class,
        'subject_id' => 1,
        'causer_type' => User::class,
        'causer_id' => $admin->id,
        'created_at' => now()->subDays(5),
    ]);

    $logMid = LogActivity::create([
        'log_name' => 'System',
        'description' => 'Log Menengah',
        'event' => 'updated',
        'subject_type' => Olimpiade::class,
        'subject_id' => 1,
        'causer_type' => User::class,
        'causer_id' => $admin->id,
        'created_at' => now()->subDays(2),
    ]);

    $logNew = LogActivity::create([
        'log_name' => 'System',
        'description' => 'Log Paling Baru',
        'event' => 'deleted',
        'subject_type' => Participant::class,
        'subject_id' => 10,
        'causer_type' => User::class,
        'causer_id' => $admin->id,
        'created_at' => now(),
    ]);

    $response = $this->actingAs($admin)
        ->getJson(route('admin.logs.activities.data'));

    $response->assertOk();
    $data = $response->json('data');

    expect($data)->toHaveCount(3)
        ->and($data[0]['id'])->toBe($logNew->id)
        ->and($data[1]['id'])->toBe($logMid->id)
        ->and($data[2]['id'])->toBe($logOld->id);
});

test('log activity filters work correctly for event, subject_type, and dates', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Utama',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');
    LogActivity::query()->delete();

    $logParticipant = LogActivity::create([
        'log_name' => 'System',
        'description' => 'Tambah Peserta',
        'event' => 'created',
        'subject_type' => Participant::class,
        'subject_id' => 10,
        'created_at' => now()->subDays(3),
    ]);

    $logOlimpiade = LogActivity::create([
        'log_name' => 'System',
        'description' => 'Ubah Olimpiade',
        'event' => 'updated',
        'subject_type' => Olimpiade::class,
        'subject_id' => 20,
        'created_at' => now()->subDays(1),
    ]);

    // 1. Filter event = updated
    $resEvent = $this->actingAs($admin)->getJson(route('admin.logs.activities.data', [
        'filterValue' => json_encode(['event' => 'updated']),
    ]));
    $resEvent->assertOk();
    $dataEvent = $resEvent->json('data');
    expect($dataEvent)->toHaveCount(1)
        ->and($dataEvent[0]['id'])->toBe($logOlimpiade->id);

    // 2. Filter subject_type = Participant
    $resSubject = $this->actingAs($admin)->getJson(route('admin.logs.activities.data', [
        'filterValue' => json_encode(['subject_type' => Participant::class]),
    ]));
    $resSubject->assertOk();
    $dataSubject = $resSubject->json('data');
    expect($dataSubject)->toHaveCount(1)
        ->and($dataSubject[0]['id'])->toBe($logParticipant->id);

    // 3. Filter date range (hari ini saja -> harusnya log 1 & 2 tidak masuk)
    $resDate = $this->actingAs($admin)->getJson(route('admin.logs.activities.data', [
        'filterValue' => json_encode([
            'date_from' => now()->format('Y-m-d'),
            'date_to' => now()->format('Y-m-d'),
        ]),
    ]));
    $resDate->assertOk();
    expect($resDate->json('data'))->toBeEmpty();
});
