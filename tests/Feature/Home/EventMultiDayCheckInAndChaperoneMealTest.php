<?php

use App\Models\Company\EventCheckInLog;
use App\Models\Company\EventCommittee;
use App\Models\Company\EventConsumptionLog;
use App\Models\Company\NationalChaperone;
use App\Models\Company\NationalParticipant;
use App\Models\Company\Participant;
use App\Models\Core\User;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    $this->seed(UserRolePermissionSeeder::class);
});

test('auto check-in records check-in log on multi-day venues and returns timeline', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $participant = Participant::factory()->create([
        'registration_number' => 'NO.OMQ-20261104-0001',
        'status' => 'verified',
    ]);

    // Check Day 1 at Penginapan
    $response = $this->actingAs($admin)->get(route('home.registration.verify', [
        'registrationNumber' => $participant->registration_number,
        'day' => 1,
        'checkpoint' => 'penginapan',
        'checkpoint_label' => 'Penginapan / Asrama Kontingen',
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home/registration/verify')
        ->where('persona', 'participant')
        ->where('isValid', true)
        ->where('activeDay', 1)
        ->where('activeCheckpoint', 'penginapan')
        ->where('autoCheckedIn', true)
        ->where('todayCheckIn.day_number', 1)
        ->where('todayCheckIn.checkpoint', 'penginapan')
        ->has('timeline', 4)
        ->where('timeline.0.is_checked_in', true)
        ->where('timeline.1.is_checked_in', false)
    );

    // Verify DB record in event_check_in_logs
    $this->assertDatabaseHas('event_check_in_logs', [
        'target_type' => 'participant',
        'target_id' => $participant->id,
        'day_number' => 1,
        'checkpoint' => 'penginapan',
    ]);

    // Check Day 2 at Venue Perlombaan
    $responseDay2 = $this->actingAs($admin)->get(route('home.registration.verify', [
        'registrationNumber' => $participant->registration_number,
        'day' => 2,
        'checkpoint' => 'venue',
        'checkpoint_label' => 'Venue Perlombaan (Penyisihan)',
    ]));

    $responseDay2->assertOk();
    $responseDay2->assertInertia(fn (Assert $page) => $page
        ->where('activeDay', 2)
        ->where('activeCheckpoint', 'venue')
        ->where('autoCheckedIn', true)
        ->where('timeline.0.is_checked_in', true)
        ->where('timeline.1.is_checked_in', true)
        ->where('timeline.2.is_checked_in', false)
    );

    $this->assertDatabaseHas('event_check_in_logs', [
        'target_type' => 'participant',
        'target_id' => $participant->id,
        'day_number' => 2,
        'checkpoint' => 'venue',
    ]);
});

test('chaperone can collectively redeem consumption meals for their assigned students', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $chaperone = NationalChaperone::create([
        'code' => 'OFF-00001',
        'created_by' => $admin->id,
        'branch' => 'Surabaya',
        'name' => 'Ustadz Ahmad Fauzan',
        'nik' => '3578012345670001',
        'gender' => 'male',
        'phone' => '081234567890',
        'status' => 'verified',
    ]);

    $student1 = Participant::factory()->create([
        'registration_number' => 'NO.OMQ-20261104-0010',
        'status' => 'verified',
    ]);

    $student2 = Participant::factory()->create([
        'registration_number' => 'NO.OMQ-20261104-0020',
        'status' => 'verified',
    ]);

    $chaperone->participants()->attach([$student1->id, $student2->id]);

    // Initial check: each student has 3 meals remaining today
    expect(EventConsumptionLog::remainingToday('participant', $student1->id))->toBe(3);
    expect(EventConsumptionLog::remainingToday('participant', $student2->id))->toBe(3);

    // Chaperone redeems for student 1 and 2, but not for self
    $response = $this->actingAs($admin)->post(route('home.verification.consumption.redeem-chaperone-students'), [
        'chaperone_id' => $chaperone->id,
        'participant_ids' => [$student1->id, $student2->id],
        'include_chaperone' => false,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Both students should have 1 meal deducted (remaining 2)
    expect(EventConsumptionLog::remainingToday('participant', $student1->id))->toBe(2);
    expect(EventConsumptionLog::remainingToday('participant', $student2->id))->toBe(2);

    // Chaperone self not redeemed yet
    expect(EventConsumptionLog::remainingToday('chaperone', $chaperone->id))->toBe(3);

    // Verify notes contain chaperone name and code
    $this->assertDatabaseHas('event_consumption_logs', [
        'consumable_type' => 'participant',
        'consumable_id' => $student1->id,
        'notes' => 'Diambilkan oleh Pendamping: Ustadz Ahmad Fauzan (OFF-00001)',
    ]);

    // Now redeem again including chaperone and student 1 only
    $response2 = $this->actingAs($admin)->post(route('home.verification.consumption.redeem-chaperone-students'), [
        'chaperone_id' => $chaperone->id,
        'participant_ids' => [$student1->id],
        'include_chaperone' => true,
    ]);

    $response2->assertRedirect();
    $response2->assertSessionHas('success');

    expect(EventConsumptionLog::remainingToday('participant', $student1->id))->toBe(1);
    expect(EventConsumptionLog::remainingToday('participant', $student2->id))->toBe(2);
    expect(EventConsumptionLog::remainingToday('chaperone', $chaperone->id))->toBe(2);
});

test('participant and chaperone event pack can be handed over and reset', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $participant = Participant::factory()->create([
        'registration_number' => 'NO.OMQ-20261104-0099',
        'status' => 'verified',
    ]);

    // 1. Non-national participant should be rejected with error
    $nonNationalResponse = $this->actingAs($admin)->post(route('home.verification.pack.handover'), [
        'type' => 'participant',
        'id' => $participant->id,
    ]);
    $nonNationalResponse->assertSessionHas('error');

    // 2. Create national qualifier record
    $national = NationalParticipant::create([
        'participant_id' => $participant->id,
        'shirt_size' => 'L',
        'status' => 'verified',
    ]);

    // Handover pack to national participant
    $response = $this->actingAs($admin)->post(route('home.verification.pack.handover'), [
        'type' => 'participant',
        'id' => $participant->id,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $national->refresh();
    expect($national->pack_received_at)->not->toBeNull()
        ->and($national->pack_received_by)->toBe($admin->id);

    // Verify Participant model accessor delegates to national
    expect($participant->fresh()->pack_received_at)->not->toBeNull()
        ->and($participant->fresh()->pack_received_by)->toBe($admin->id);

    // Reset pack
    $resetResponse = $this->actingAs($admin)->post(route('home.verification.pack.reset'), [
        'type' => 'participant',
        'id' => $participant->id,
    ]);

    $resetResponse->assertRedirect();
    $resetResponse->assertSessionHas('success');

    $national->refresh();
    expect($national->pack_received_at)->toBeNull()
        ->and($national->pack_received_by)->toBeNull();

    expect($participant->fresh()->pack_received_at)->toBeNull()
        ->and($participant->fresh()->pack_received_by)->toBeNull();
});

test('committee shows assigned daily duty for the active day', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $committee = EventCommittee::create([
        'code' => 'CREW-00088',
        'created_by' => $admin->id,
        'name' => 'Siti Aisyah',
        'gender' => 'female',
        'division' => 'Registrasi & Kedatangan',
        'position' => 'Koordinator Meja Registrasi',
        'access_zone' => 'Zona 1 & 2',
        'daily_duties' => [
            1 => 'Penyambutan & Check-in Asrama',
            2 => 'Pintu Masuk Utama Venue Olimpiade',
            3 => 'Pintu Masuk Utama Venue Olimpiade',
            4 => 'Pemandu Rombongan Study Tour',
        ],
        'status' => 'active',
        'event_year' => 2026,
    ]);

    // Day 1
    $r1 = $this->actingAs($admin)->get(route('home.registration.verify', [
        'registrationNumber' => $committee->code,
        'day' => 1,
    ]));

    $r1->assertOk();
    $r1->assertInertia(fn (Assert $page) => $page
        ->where('persona', 'committee')
        ->where('activeDay', 1)
        ->where('entity.duty_today', 'Penyambutan & Check-in Asrama')
    );

    // Day 4
    $r4 = $this->actingAs($admin)->get(route('home.registration.verify', [
        'registrationNumber' => $committee->code,
        'day' => 4,
    ]));

    $r4->assertOk();
    $r4->assertInertia(fn (Assert $page) => $page
        ->where('activeDay', 4)
        ->where('entity.duty_today', 'Pemandu Rombongan Study Tour')
    );
});

test('participant can check-in to multiple checkpoints on the same day', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $participant = Participant::factory()->create([
        'registration_number' => 'NO.OMQ-20261104-0002',
        'status' => 'verified',
    ]);

    // Check-in 1: Penginapan Subuh (Day 2)
    $this->actingAs($admin)->get(route('home.registration.verify', [
        'registrationNumber' => $participant->registration_number,
        'day' => 2,
        'checkpoint' => 'penginapan',
        'checkpoint_label' => 'Penginapan / Asrama & Kumpul Bus',
    ]))->assertOk();

    // Check-in 2: Kunjungan Kediaman Menteri Pertanian (Day 2)
    $this->actingAs($admin)->get(route('home.registration.verify', [
        'registrationNumber' => $participant->registration_number,
        'day' => 2,
        'checkpoint' => 'kunjungan_mentan',
        'checkpoint_label' => 'Kunjungan Kediaman Menteri Pertanian',
    ]))->assertOk();

    // Check-in 3: Venue Lomba (Day 2)
    $res3 = $this->actingAs($admin)->get(route('home.registration.verify', [
        'registrationNumber' => $participant->registration_number,
        'day' => 2,
        'checkpoint' => 'venue_lomba',
        'checkpoint_label' => 'Venue Perlombaan (Gate Utama)',
    ]));

    $res3->assertOk();
    $res3->assertInertia(fn (Assert $page) => $page
        ->where('timeline.1.is_checked_in', true)
        ->has('timeline.1.all_logs', 3)
        ->where('timeline.1.all_logs.0.checkpoint', 'penginapan')
        ->where('timeline.1.all_logs.1.checkpoint', 'kunjungan_mentan')
        ->where('timeline.1.all_logs.2.checkpoint', 'venue_lomba')
    );

    // Verify 3 separate logs in DB
    $this->assertDatabaseCount('event_check_in_logs', 3);
});

test('administrator can reset check-in logs', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $regularUser = User::factory()->create(['email_verified_at' => now()]);
    $regularUser->assignRole('Participant');

    $participant = Participant::factory()->create([
        'registration_number' => 'NO.OMQ-20261104-0003',
        'status' => 'verified',
    ]);

    // Create 2 check-in logs for today Day 2
    $this->actingAs($admin)->get(route('home.registration.verify', [
        'registrationNumber' => $participant->registration_number,
        'day' => 2,
        'checkpoint' => 'penginapan',
    ]))->assertOk();

    $this->actingAs($admin)->get(route('home.registration.verify', [
        'registrationNumber' => $participant->registration_number,
        'day' => 2,
        'checkpoint' => 'kunjungan_mentan',
    ]))->assertOk();

    $this->assertDatabaseCount('event_check_in_logs', 2);

    // Non-admin attempt to reset should be 403
    $this->actingAs($regularUser)->post(route('home.verification.checkin.reset'), [
        'persona' => 'participant',
        'target_id' => $participant->id,
    ])->assertForbidden();

    // Admin reset single log by log_id
    $log = EventCheckInLog::where('checkpoint', 'kunjungan_mentan')->first();
    $this->actingAs($admin)->post(route('home.verification.checkin.reset'), [
        'persona' => 'participant',
        'target_id' => $participant->id,
        'log_id' => $log->id,
    ])->assertRedirect()->assertSessionHas('success');

    $this->assertDatabaseCount('event_check_in_logs', 1);
    $this->assertDatabaseMissing('event_check_in_logs', ['id' => $log->id]);

    // Admin reset remaining logs for Day 2
    $this->actingAs($admin)->post(route('home.verification.checkin.reset'), [
        'persona' => 'participant',
        'target_id' => $participant->id,
        'day_number' => 2,
    ])->assertRedirect()->assertSessionHas('success');

    $this->assertDatabaseCount('event_check_in_logs', 0);
});
