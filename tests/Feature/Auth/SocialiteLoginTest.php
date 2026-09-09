<?php

use App\Models\Core\Social;
use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Administrators', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Participant', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);
});

function mockSocialiteUser(string $id, string $email, string $name, bool $emailVerified = true): SocialiteUser
{
    $abstractUser = Mockery::mock(SocialiteUser::class);
    $abstractUser->shouldReceive('getId')->andReturn($id);
    $abstractUser->shouldReceive('getEmail')->andReturn($email);
    $abstractUser->shouldReceive('getName')->andReturn($name);
    $abstractUser->token = 'mock-access-token';
    $abstractUser->refreshToken = 'mock-refresh-token';
    $abstractUser->user = ['email_verified' => $emailVerified];

    return $abstractUser;
}

test('redirects to google oauth provider', function () {
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('redirect')->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.redirect', ['provider' => 'google']));
    $response->assertRedirect('https://accounts.google.com/o/oauth2/auth');
});

test('existing participant can login with google', function () {
    $user = User::factory()->create([
        'email' => 'peserta@example.com',
        'name' => 'Peserta Satu',
    ]);
    $user->assignRole('Participant');

    $mockUser = mockSocialiteUser('google-uid-101', 'peserta@example.com', 'Peserta Satu');

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($mockUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.callback', ['provider' => 'google']));

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('student.dashboard'));

    expect(Social::where('user_id', $user->id)->where('provider', 'google')->where('provider_id', 'google-uid-101')->exists())->toBeTrue();
});

test('admin can login with google', function () {
    $admin = User::factory()->create([
        'email' => 'admin@omatiq.com',
        'name' => 'Super Admin',
    ]);
    $admin->assignRole('Administrators');

    $mockUser = mockSocialiteUser('google-admin-uid', 'admin@omatiq.com', 'Super Admin');

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($mockUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.callback', ['provider' => 'google']));

    $this->assertAuthenticatedAs($admin);
    $response->assertRedirect(route('admin.dashboard'));
});

test('unregistered google user is redirected back to login with message', function () {
    $mockUser = mockSocialiteUser('google-unknown-uid', 'unknown@example.com', 'Unknown Person');

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($mockUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.callback', ['provider' => 'google']));

    $this->assertGuest();
    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors(['email']);
    $response->assertSessionHas('error');
});

test('completed teacher can login with google via unified callback', function () {
    $teacher = User::factory()->create([
        'email' => 'guru.resmi@example.com',
        'name' => 'Guru Teladan',
        'teacher_profile_completed_at' => now(),
    ]);
    $teacher->assignRole('Teacher');

    $mockUser = mockSocialiteUser('google-guru-uid-99', 'guru.resmi@example.com', 'Guru Teladan');

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($mockUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.callback', ['provider' => 'google']));

    $this->assertAuthenticatedAs($teacher);
    $response->assertRedirect(route('teacher.dashboard'));
});

test('incomplete teacher with placeholder email is blocked from google login', function () {
    $teacher = User::factory()->create([
        'email' => 'guru123@penyaluran.local',
        'name' => 'Guru Incomplete',
        'teacher_profile_completed_at' => null,
    ]);
    $teacher->assignRole('Teacher');

    $mockUser = mockSocialiteUser('google-guru-uid-123', 'guru123@penyaluran.local', 'Guru Incomplete');

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($mockUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.callback', ['provider' => 'google']));

    $this->assertGuest();
    $response->assertRedirect(route('teacher.login'));
    $response->assertSessionHasErrors(['email']);
    $response->assertSessionHas('error');
});
