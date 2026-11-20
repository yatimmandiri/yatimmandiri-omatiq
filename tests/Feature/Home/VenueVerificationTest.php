<?php

use App\Models\Company\EventCommittee;
use App\Models\Company\EventConsumptionLog;
use App\Models\Company\EventGuest;
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

test('unauthenticated visitor is redirected to login when visiting /verifikasi', function () {
    $response = $this->get(route('home.registration.verify', ['registrationNumber' => 'NO.OMQ-20261104-0001']));
    $response->assertRedirect(route('login'));
});

test('non-administrator non-verifier user is forbidden from visiting /verifikasi', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('Users');

    $response = $this->actingAs($user)->get(route('home.registration.verify', ['registrationNumber' => 'NO.OMQ-20261104-0001']));
    $response->assertForbidden();
});

test('universal gate terminal /verifikasi displays valid committee and records passive check-in', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $committee = EventCommittee::create([
        'code' => 'CREW-00015',
        'created_by' => $admin->id,
        'name' => 'Fauzi Rahman',
        'gender' => 'male',
        'division' => 'Dewan Juri',
        'position' => 'Juri Al-Quran',
        'access_zone' => 'All Access',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    expect($committee->checked_in_at)->toBeNull();

    $response = $this->actingAs($admin)->get(route('home.registration.verify', ['registrationNumber' => 'CREW-00015']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home/registration/verify')
        ->where('persona', 'committee')
        ->where('isValid', true)
        ->where('entity.name', 'Fauzi Rahman')
    );

    expect($committee->fresh()->checked_in_at)->not->toBeNull();
});

test('universal gate terminal /verifikasi displays valid guest and records passive check-in', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $guest = EventGuest::create([
        'code' => 'INV-00008',
        'created_by' => $admin->id,
        'name' => 'Bpk. H. Bambang',
        'institution' => 'Pemerintah Kota Surabaya',
        'category' => 'vip',
        'table_number' => 'Meja VVIP 01',
        'status' => 'confirmed',
        'event_year' => 2026,
    ]);

    expect($guest->checked_in_at)->toBeNull();

    $response = $this->actingAs($admin)->get(route('home.registration.verify', ['registrationNumber' => 'INV-00008']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home/registration/verify')
        ->where('persona', 'guest')
        ->where('isValid', true)
        ->where('entity.name', 'Bpk. H. Bambang')
    );

    expect($guest->fresh()->checked_in_at)->not->toBeNull();
});

test('administrator can reset guest check-in for the day', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $guest = EventGuest::create([
        'code' => 'INV-00010',
        'created_by' => $admin->id,
        'name' => 'Dr. H. Sukarno',
        'institution' => 'Universitas Surabaya',
        'category' => 'vip',
        'status' => 'attended',
        'checked_in_at' => now(),
        'event_year' => 2026,
    ]);

    expect($guest->checked_in_at)->not->toBeNull();

    $response = $this->actingAs($admin)->post(route('home.verification.guest.reset', ['guest' => $guest->id]));
    $response->assertRedirect();
    $response->assertSessionHas('success');

    $guest->refresh();
    expect($guest->checked_in_at)->toBeNull()
        ->and($guest->status)->toBe('confirmed');
});

test('consumption quota can be redeemed up to 3 times per day and blocks 4th attempt', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $participant = Participant::factory()->create([
        'registration_number' => 'NO.OMQ-20261104-0001',
        'status' => 'verified',
    ]);

    // Initial check: remaining is 3
    expect(EventConsumptionLog::remainingToday('participant', $participant->id))->toBe(3);

    // 1st redemption
    $r1 = $this->actingAs($admin)->post(route('home.verification.consumption.redeem'), [
        'type' => 'participant',
        'id' => $participant->id,
    ]);
    $r1->assertSessionHas('success');
    expect(EventConsumptionLog::remainingToday('participant', $participant->id))->toBe(2);

    // 2nd redemption
    $r2 = $this->actingAs($admin)->post(route('home.verification.consumption.redeem'), [
        'type' => 'participant',
        'id' => $participant->id,
    ]);
    $r2->assertSessionHas('success');
    expect(EventConsumptionLog::remainingToday('participant', $participant->id))->toBe(1);

    // 3rd redemption
    $r3 = $this->actingAs($admin)->post(route('home.verification.consumption.redeem'), [
        'type' => 'participant',
        'id' => $participant->id,
    ]);
    $r3->assertSessionHas('success');
    expect(EventConsumptionLog::remainingToday('participant', $participant->id))->toBe(0);

    // 4th redemption should fail
    $r4 = $this->actingAs($admin)->post(route('home.verification.consumption.redeem'), [
        'type' => 'participant',
        'id' => $participant->id,
    ]);
    $r4->assertSessionHas('error');
    expect(EventConsumptionLog::remainingToday('participant', $participant->id))->toBe(0);

    // Admin can reset quota back to 3
    $rReset = $this->actingAs($admin)->post(route('home.verification.consumption.reset'), [
        'type' => 'participant',
        'id' => $participant->id,
    ]);
    $rReset->assertSessionHas('success');
    expect(EventConsumptionLog::remainingToday('participant', $participant->id))->toBe(3);
});

test('old route /verifikasi/panitia redirects to universal /verifikasi', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->get(route('home.committee.verify', ['code' => 'CREW-00015']));
    $response->assertRedirect(route('home.registration.verify', ['registrationNumber' => 'CREW-00015']));
});

test('old route /verifikasi/tamu redirects to universal /verifikasi', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->get(route('home.guest.verify', ['code' => 'INV-00008']));
    $response->assertRedirect(route('home.registration.verify', ['registrationNumber' => 'INV-00008']));
});

test('old route /verifikasi/pendamping redirects to universal /verifikasi', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->get(route('home.chaperone.verify', ['code' => 'OFF-00042']));
    $response->assertRedirect(route('home.registration.verify', ['registrationNumber' => 'OFF-00042']));
});
