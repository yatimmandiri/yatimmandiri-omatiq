<?php

use App\Models\Company\EventGuest;
use App\Models\Core\User;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    $this->seed(UserRolePermissionSeeder::class);
});

test('administrator can create guest with auto-generated INV code and table allocation', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->post(route('admin.companies.guests.store'), [
        'name' => 'Prof. Dr. Ir. H. Mohammad Nuh, DEA',
        'institution' => 'Kementerian / Dewan Pembina',
        'position' => 'Tokoh Pendidikan Nasional',
        'category' => 'vvip',
        'phone' => '081198765432',
        'email' => 'm.nuh@undangan.local',
        'table_number' => 'Meja VVIP Kehormatan 01',
        'seat_count' => 2,
        'status' => 'confirmed',
        'notes' => 'Memberikan sambutan pembukaan',
    ]);

    $response->assertRedirect(route('admin.companies.guests.index'));
    $response->assertSessionHas('success');

    $guest = EventGuest::first();
    expect($guest)->not->toBeNull()
        ->and($guest->code)->toBe('INV-00001')
        ->and($guest->name)->toBe('Prof. Dr. Ir. H. Mohammad Nuh, DEA')
        ->and($guest->category)->toBe('vvip')
        ->and($guest->table_number)->toBe('Meja VVIP Kehormatan 01')
        ->and($guest->seat_count)->toBe(2);
});

test('bulk check-in marks selected guests as attended and sets checked_in_at (Plan C)', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $g1 = EventGuest::create([
        'code' => 'INV-00001',
        'created_by' => $admin->id,
        'name' => 'Kepala Dinas Pendidikan',
        'category' => 'vip',
        'status' => 'confirmed',
        'event_year' => 2026,
    ]);

    $g2 = EventGuest::create([
        'code' => 'INV-00002',
        'created_by' => $admin->id,
        'name' => 'Pimpinan Bank Jatim Syariah',
        'category' => 'sponsor',
        'status' => 'confirmed',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->postJson(route('admin.companies.guests.bulk-check-in'), [
        'ids' => [$g1->id, $g2->id],
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'count' => 2,
        ]);

    expect($g1->fresh()->checked_in_at)->not->toBeNull()
        ->and($g1->fresh()->status)->toBe('attended')
        ->and($g2->fresh()->checked_in_at)->not->toBeNull()
        ->and($g2->fresh()->status)->toBe('attended');
});

test('print card renders honorary guest pass', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $guest = EventGuest::create([
        'code' => 'INV-00001',
        'created_by' => $admin->id,
        'name' => 'Bpk. H. Ahmad Fauzi',
        'institution' => 'Pemerintah Kota Surabaya',
        'position' => 'Pemerintah Daerah',
        'category' => 'vip',
        'table_number' => 'Meja VIP 03',
        'seat_count' => 1,
        'status' => 'confirmed',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.companies.guests.card', $guest));
    $response->assertOk()
        ->assertViewIs('cards.guest-card')
        ->assertSee('INV-00001')
        ->assertSee('Bpk. H. Ahmad Fauzi')
        ->assertSee('MEJA VIP 03');
});
