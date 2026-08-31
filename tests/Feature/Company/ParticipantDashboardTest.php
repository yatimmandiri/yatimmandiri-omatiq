<?php

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Core\Permission;
use App\Models\Core\Role;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'Administrators', 'guard_name' => 'web']);
    Role::create(['name' => 'Participant', 'guard_name' => 'web']);
    Role::create(['name' => 'Teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'Users', 'guard_name' => 'web']);

    Permission::create(['name' => 'view-participant', 'guard_name' => 'web'])->assignRole(['Participant', 'Administrators']);
    Permission::create(['name' => 'data-participant', 'guard_name' => 'web'])->assignRole(['Participant', 'Administrators']);
    Permission::create(['name' => 'update-participant', 'guard_name' => 'web'])->assignRole('Administrators');
    Permission::create(['name' => 'delete-participant', 'guard_name' => 'web'])->assignRole('Administrators');
});

test('guest cannot access participant dashboard', function () {
    $response = $this->get(route('admin.dashboard'));
    $response->assertRedirect(route('login'));
});

test('participant can view their own dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('Participant');

    $participant = Participant::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('admin.dashboard'));
    $response->assertOk();
});

test('participant without linked participant record sees empty state', function () {
    $user = User::factory()->create();
    $user->assignRole('Participant');

    $response = $this->actingAs($user)->get(route('admin.dashboard'));
    $response->assertOk();
});

test('participant cannot view other participant details', function () {
    $user = User::factory()->create();
    $user->assignRole('Participant');

    $ownParticipant = Participant::factory()->create(['user_id' => $user->id]);

    $otherParticipant = Participant::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.companies.participants.show', $otherParticipant));
    $response->assertForbidden();
});

test('participant cannot access participant index (data table)', function () {
    $user = User::factory()->create();
    $user->assignRole('Participant');

    Participant::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('admin.companies.participants.index'));
    $response->assertForbidden();
});

test('admin can view any participant', function () {
    $user = User::factory()->create();
    $user->assignRole('Administrators');

    $participant = Participant::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.companies.participants.show', $participant));
    $response->assertOk();
});

test('admin can access participant index', function () {
    $user = User::factory()->create();
    $user->assignRole('Administrators');

    $response = $this->actingAs($user)->get(route('admin.companies.participants.index'));
    $response->assertOk();
});

test('admin can filter participant data by operational fields', function () {
    $user = User::factory()->create();
    $user->assignRole('Administrators');

    $math = Olimpiade::factory()->create([
        'name' => 'Olimpiade Matematika',
        'event_year' => 2026,
    ]);
    $quran = Olimpiade::factory()->create([
        'name' => 'Olimpiade Al-Quran',
        'event_year' => 2027,
    ]);

    $matched = Participant::factory()->create([
        'olimpiade_id' => $math->id,
        'status' => 'verified',
        'registration_type' => 'teacher',
        'event_year' => 2026,
        'payment_status' => 'paid',
        'branch' => 'TANGERANG',
    ]);

    Participant::factory()->create([
        'olimpiade_id' => $math->id,
        'status' => 'submitted',
        'registration_type' => 'public',
        'event_year' => 2026,
        'payment_status' => 'waiting_confirmation',
        'branch' => 'SURABAYA',
    ]);

    Participant::factory()->create([
        'olimpiade_id' => $quran->id,
        'status' => 'rejected',
        'registration_type' => 'public',
        'event_year' => 2027,
        'payment_status' => 'unpaid',
        'branch' => 'TANGERANG',
    ]);

    $this->actingAs($user)
        ->get(route('admin.companies.participants.data', [
            'filterValue' => [
                'olimpiade_id' => (string) $math->id,
                'status' => 'verified',
                'registration_type' => 'teacher',
                'event_year' => '2026',
                'payment_status' => 'paid',
                'branch' => 'TANGERANG',
            ],
        ]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $matched->id);
});
