<?php

use App\Models\Company\EventCommittee;
use App\Models\Core\User;
use Database\Seeders\UserRolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    $this->seed(UserRolePermissionSeeder::class);
});

test('administrator can create committee member with auto-generated CREW code and optional photo', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $response = $this->actingAs($admin)->post(route('admin.companies.committees.store'), [
        'name' => 'Dr. H. Ahmad Dahlan, M.Pd.',
        'nik' => '3578012345670001',
        'gender' => 'male',
        'phone' => '081234567890',
        'email' => 'ahmad.dahlan@omatiq.org',
        'division' => 'Dewan Juri Nasional',
        'position' => 'Ketua Dewan Juri Matematika',
        'access_zone' => 'All Access',
        'status' => 'active',
        'notes' => 'Koordinator juri final matematika',
        'photo' => UploadedFile::fake()->image('juri.jpg', 400, 500),
    ]);

    $response->assertRedirect(route('admin.companies.committees.index'));
    $response->assertSessionHas('success');

    $committee = EventCommittee::first();
    expect($committee)->not->toBeNull()
        ->and($committee->code)->toBe('CREW-00001')
        ->and($committee->name)->toBe('Dr. H. Ahmad Dahlan, M.Pd.')
        ->and($committee->division)->toBe('Dewan Juri Nasional')
        ->and($committee->photo_path)->not->toBeNull();

    Storage::disk('public')->assertExists($committee->photo_path);
});

test('administrator can update committee and toggle status', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $committee = EventCommittee::create([
        'code' => 'CREW-00001',
        'created_by' => $admin->id,
        'name' => 'Fauzi Rahman',
        'gender' => 'male',
        'division' => 'Acara & Lomba',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->put(route('admin.companies.committees.status', $committee), [
        'status' => 'inactive',
    ]);

    $response->assertSessionHas('success');
    expect($committee->fresh()->status)->toBe('inactive');
});

test('bulk check-in updates checked_in_at for selected committees (Plan C)', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $c1 = EventCommittee::create([
        'code' => 'CREW-00001',
        'created_by' => $admin->id,
        'name' => 'Crew Satu',
        'division' => 'Acara',
        'gender' => 'male',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    $c2 = EventCommittee::create([
        'code' => 'CREW-00002',
        'created_by' => $admin->id,
        'name' => 'Crew Dua',
        'division' => 'Logistik',
        'gender' => 'female',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->postJson(route('admin.companies.committees.bulk-check-in'), [
        'ids' => [$c1->id, $c2->id],
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'count' => 2,
        ]);

    expect($c1->fresh()->checked_in_at)->not->toBeNull()
        ->and($c2->fresh()->checked_in_at)->not->toBeNull();
});

test('print card renders committee badge pass', function () {
    $admin = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('Administrators');

    $committee = EventCommittee::create([
        'code' => 'CREW-00001',
        'created_by' => $admin->id,
        'name' => 'Siti Aminah',
        'division' => 'Konsumsi',
        'position' => 'Koordinator Konsumsi',
        'access_zone' => 'All Access',
        'gender' => 'female',
        'status' => 'active',
        'event_year' => 2026,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.companies.committees.card', $committee));
    $response->assertOk()
        ->assertViewIs('cards.committee-card')
        ->assertSee('CREW-00001')
        ->assertSee('Siti Aminah')
        ->assertSee('KONSUMSI');
});
