<?php

use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);
    Config::set('services.penyaluran.url', 'https://penyaluran-test.example.com');
});

test('guru login screen can be rendered', function () {
    $response = $this->get(route('teacher.login'));
    $response->assertOk();
});

test('guru first time login creates user and redirects to complete profile', function () {
    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/login' => Http::response([
            'success' => true,
            'token' => 'penyaluran-token-101',
        ], 200),
        'https://penyaluran-test.example.com/api/v1/guru/me' => Http::response([
            'success' => true,
            'data' => [
                'id' => 101,
                'name' => 'Ustadz Ahmad',
            ],
        ], 200),
    ]);

    $response = $this->post(route('teacher.login.store'), [
        'phone' => '081234567890',
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('teacher.profile.edit'));

    $user = User::where('penyaluran_id', 101)->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole('Teacher'))->toBeTrue()
        ->and($user->email)->toBe('guru101@penyaluran.local')
        ->and($user->needsTeacherProfileCompletion())->toBeTrue();
});

test('guru login with invalid phone from penyaluran shows error', function () {
    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/login' => Http::response([
            'success' => false,
            'message' => 'Nomor HP tidak ditemukan.',
        ], 404),
    ]);

    $response = $this->post(route('teacher.login.store'), [
        'phone' => '081999999999',
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors(['phone']);
});

test('guru login with wrong local password shows error', function () {
    $user = User::factory()->create([
        'penyaluran_id' => 202,
        'email' => 'guru202@example.com',
        'phone' => '081234567888',
        'password' => Hash::make('custom-password-123'),
        'teacher_profile_completed_at' => now(),
    ]);
    $user->assignRole('Teacher');

    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/login' => Http::response([
            'success' => true,
            'token' => 'penyaluran-token-202',
        ], 200),
        'https://penyaluran-test.example.com/api/v1/guru/me' => Http::response([
            'success' => true,
            'data' => ['id' => 202, 'name' => $user->name],
        ], 200),
    ]);

    $response = $this->post(route('teacher.login.store'), [
        'phone' => '081234567888',
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors(['password']);
});

test('completed teacher login redirects directly to dashboard', function () {
    $user = User::factory()->create([
        'penyaluran_id' => 303,
        'email' => 'guru303@example.com',
        'phone' => '081234567777',
        'password' => Hash::make('mypassword123'),
        'teacher_profile_completed_at' => now(),
    ]);
    $user->assignRole('Teacher');

    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/login' => Http::response([
            'success' => true,
            'token' => 'penyaluran-token-303',
        ], 200),
        'https://penyaluran-test.example.com/api/v1/guru/me' => Http::response([
            'success' => true,
            'data' => [
                'id' => 303,
                'name' => $user->name,
                'sanggars' => [
                    ['id' => 10, 'name' => 'Sanggar Uji', 'type' => 'Genius'],
                ],
                'students' => [
                    ['id' => 100, 'name' => 'Santri Uji', 'nik' => '3578010101010001', 'gender' => 'L'],
                ],
            ],
        ], 200),
    ]);

    $response = $this->post(route('teacher.login.store'), [
        'phone' => '081234567777',
        'password' => 'mypassword123',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('teacher.dashboard'));
    $response->assertSessionHas('penyaluran_sanggars');
    $response->assertSessionHas('penyaluran_students');
    expect(session('penyaluran_sanggars')[0]['name'])->toBe('Sanggar Uji')
        ->and(session('penyaluran_students')[0]['name'])->toBe('Santri Uji');
});

test('teacher can complete profile and update email to penyaluran server', function () {
    Http::fake([
        'https://penyaluran-test.example.com/api/v1/guru/me' => Http::response([
            'success' => true,
            'data' => ['id' => 404, 'email' => 'guru.resmi@example.com'],
        ], 200),
    ]);

    $teacher = User::factory()->create([
        'penyaluran_id' => 404,
        'email' => 'guru404@penyaluran.local',
        'penyaluran_token' => 'token-404',
        'teacher_profile_completed_at' => null,
    ]);
    $teacher->assignRole('Teacher');

    $response = $this
        ->actingAs($teacher)
        ->withSession(['penyaluran_token' => 'token-404'])
        ->put(route('teacher.profile.update'), [
            'email' => 'guru.resmi@example.com',
            'password' => 'secret12345',
            'password_confirmation' => 'secret12345',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('teacher.dashboard'));

    $teacher->refresh();
    expect($teacher->email)->toBe('guru.resmi@example.com')
        ->and($teacher->teacher_profile_completed_at)->not->toBeNull()
        ->and(Hash::check('secret12345', $teacher->password))->toBeTrue();
});

test('teacher can logout from guru portal', function () {
    $teacher = User::factory()->create([
        'penyaluran_id' => 505,
        'email' => 'guru505@example.com',
    ]);
    $teacher->assignRole('Teacher');

    $response = $this->actingAs($teacher)->post(route('teacher.logout'));

    $this->assertGuest();
    $response->assertRedirect(route('teacher.login'));
});

test('legacy guru routes redirect to teacher routes', function () {
    $this->get('/guru/login')->assertRedirect('/teacher/login');
    $this->get('/guru')->assertRedirect('/teacher/login');
    $this->get('/guru/dashboard')->assertRedirect('/teacher/dashboard');
    $this->get('/guru/biodata')->assertRedirect('/teacher/biodata');
    $this->get('/guru/data-peserta')->assertRedirect('/teacher/data-peserta');
    $this->get('/guru/data-binaan')->assertRedirect('/teacher/data-binaan');
    $this->get('/guru/data-sanggar')->assertRedirect('/teacher/data-sanggar');
    $this->get('/guru/absensi')->assertRedirect('/teacher/absensi');
});
