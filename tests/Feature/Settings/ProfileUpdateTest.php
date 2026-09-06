<?php

use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('admin.profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('admin.profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('admin.profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('teacher profile information can be updated with name and email synced to penyaluran', function () {
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);

    Http::fake([
        '*/api/v1/guru/me' => Http::response(['status' => 'success', 'data' => ['name' => 'Guru Update', 'email' => 'guru.update@example.com']], 200),
    ]);

    $teacher = User::factory()->create([
        'name' => 'Guru Awal',
        'email' => 'guru.awal@example.com',
        'penyaluran_id' => 999,
        'penyaluran_token' => 'test-token-123',
        'teacher_profile_completed_at' => now(),
    ]);
    $teacher->assignRole('Teacher');

    $response = $this
        ->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'test-token-123'])
        ->patch(route('admin.profile.update'), [
            'name' => 'Guru Update',
            'email' => 'guru.update@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.profile.edit'));

    Http::assertSent(function (Request $request) {
        return $request->url() === 'https://penyaluran.yatimmandiri.org/api/v1/guru/me'
            && $request->method() === 'PUT'
            && $request['name'] === 'Guru Update'
            && $request['email'] === 'guru.update@example.com';
    });

    $teacher->refresh();
    expect($teacher->name)->toBe('Guru Update');
    expect($teacher->email)->toBe('guru.update@example.com');
    expect($teacher->hasVerifiedEmail())->toBeTrue();
});

test('teacher can update name only and only name is sent to penyaluran', function () {
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);

    Http::fake([
        '*/api/v1/guru/me' => Http::response(['status' => 'success'], 200),
    ]);

    $teacher = User::factory()->create([
        'name' => 'Guru Lama',
        'email' => 'guru.tetap@example.com',
        'penyaluran_id' => 999,
        'penyaluran_token' => 'test-token-123',
        'teacher_profile_completed_at' => now(),
    ]);
    $teacher->assignRole('Teacher');

    $response = $this
        ->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'test-token-123'])
        ->patch(route('admin.profile.update'), [
            'name' => 'Guru Baru Saja',
            'email' => 'guru.tetap@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.profile.edit'));

    Http::assertSent(function (Request $request) {
        $data = $request->data();

        return ($data['name'] ?? null) === 'Guru Baru Saja' && ! array_key_exists('email', $data);
    });

    expect($teacher->refresh()->name)->toBe('Guru Baru Saja');
});

test('teacher profile is not updated locally if penyaluran API fails', function () {
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);

    Http::fake([
        '*/api/v1/guru/me' => Http::response(['message' => 'Email sudah digunakan di Penyaluran.'], 422),
    ]);

    $teacher = User::factory()->create([
        'name' => 'Guru Asli',
        'email' => 'guru.asli@example.com',
        'penyaluran_id' => 999,
        'penyaluran_token' => 'test-token-123',
        'teacher_profile_completed_at' => now(),
    ]);
    $teacher->assignRole('Teacher');

    $response = $this
        ->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'test-token-123'])
        ->patch(route('admin.profile.update'), [
            'name' => 'Guru Gagal',
            'email' => 'guru.gagal@example.com',
        ]);

    $response
        ->assertSessionHasErrors(['email'])
        ->assertRedirect();

    $teacher->refresh();
    expect($teacher->name)->toBe('Guru Asli');
    expect($teacher->email)->toBe('guru.asli@example.com');
});

test('teacher cannot delete their account from settings', function () {
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);

    $teacher = User::factory()->create([
        'penyaluran_id' => 999,
        'teacher_profile_completed_at' => now(),
    ]);
    $teacher->assignRole('Teacher');

    $response = $this
        ->actingAs($teacher)
        ->delete(route('admin.profile.destroy'), [
            'password' => 'password',
        ]);

    $response->assertForbidden();
    expect($teacher->fresh())->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('admin.profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home.index'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('admin.profile.edit'))
        ->delete(route('admin.profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('admin.profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
