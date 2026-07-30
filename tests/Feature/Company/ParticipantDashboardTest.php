<?php

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

    Permission::create(['name' => 'view-participant', 'guard_name' => 'web'])->assignRole('Participant');
    Permission::create(['name' => 'data-participant', 'guard_name' => 'web'])->assignRole('Participant');
    Permission::create(['name' => 'view-participant', 'guard_name' => 'web'])->assignRole('Administrators');
    Permission::create(['name' => 'data-participant', 'guard_name' => 'web'])->assignRole('Administrators');
    Permission::create(['name' => 'update-participant', 'guard_name' => 'web'])->assignRole('Administrators');
    Permission::create(['name' => 'delete-participant', 'guard_name' => 'web'])->assignRole('Administrators');
});

test('guest cannot access participant dashboard', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('participant can view their own dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('Participant');

    $participant = Participant::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));
    $response->assertOk();
});

test('participant without linked participant record sees empty state', function () {
    $user = User::factory()->create();
    $user->assignRole('Participant');

    $response = $this->actingAs($user)->get(route('dashboard'));
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
