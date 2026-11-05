<?php

use App\Models\Company\EventCommittee;
use App\Models\Company\EventGuest;
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

    $response = $this->get(route('home.registration.verify', ['registrationNumber' => 'CREW-00015']));
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

    $response = $this->get(route('home.registration.verify', ['registrationNumber' => 'INV-00008']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home/registration/verify')
        ->where('persona', 'guest')
        ->where('isValid', true)
        ->where('entity.name', 'Bpk. H. Bambang')
    );

    expect($guest->fresh()->checked_in_at)->not->toBeNull();
});

test('old route /verifikasi/panitia redirects to universal /verifikasi', function () {
    $response = $this->get(route('home.committee.verify', ['code' => 'CREW-00015']));
    $response->assertRedirect(route('home.registration.verify', ['registrationNumber' => 'CREW-00015']));
});

test('old route /verifikasi/tamu redirects to universal /verifikasi', function () {
    $response = $this->get(route('home.guest.verify', ['code' => 'INV-00008']));
    $response->assertRedirect(route('home.registration.verify', ['registrationNumber' => 'INV-00008']));
});

test('old route /verifikasi/pendamping redirects to universal /verifikasi', function () {
    $response = $this->get(route('home.chaperone.verify', ['code' => 'OFF-00042']));
    $response->assertRedirect(route('home.registration.verify', ['registrationNumber' => 'OFF-00042']));
});
