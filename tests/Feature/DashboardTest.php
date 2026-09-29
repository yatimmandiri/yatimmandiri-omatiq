<?php

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
    );
});
