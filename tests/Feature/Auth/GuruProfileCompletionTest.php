<?php

use App\Models\Core\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function createProfileCompletionTeacher(array $attributes = []): User
{
    Role::firstOrCreate(['name' => 'Teacher', 'guard_name' => 'web']);

    $user = User::factory()->create([
        'email' => 'guru123@penyaluran.local',
        'penyaluran_id' => 123,
        ...$attributes,
    ]);

    $user->assignRole('Teacher');

    return $user;
}

test('teacher with placeholder email must complete profile first', function () {
    $teacher = createProfileCompletionTeacher();

    $this->actingAs($teacher)
        ->get(route('admin.profile.edit'))
        ->assertRedirect(route('guru.profile.edit'));
});

test('teacher can complete email and password before entering protected area', function () {
    $teacher = createProfileCompletionTeacher();

    $this->actingAs($teacher)
        ->put(route('guru.profile.update'), [
            'email' => 'guru@example.com',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])
        ->assertRedirect(route('admin.dashboard'));

    $teacher->refresh();

    expect($teacher->email)->toBe('guru@example.com')
        ->and($teacher->teacher_profile_completed_at)->not->toBeNull()
        ->and($teacher->needsTeacherProfileCompletion())->toBeFalse();

    $this->actingAs($teacher)
        ->get(route('admin.profile.edit'))
        ->assertOk();
});
