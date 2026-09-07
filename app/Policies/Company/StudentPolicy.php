<?php

namespace App\Policies\Company;

use App\Models\Company\Student;
use App\Models\Core\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-student');
    }

    public function view(User $user, Student $student): bool
    {
        return $user->hasPermissionTo('view-student') || ($user->hasRole('Teacher') && $student->mentor_id === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-student') || $user->hasRole('Teacher');
    }

    public function update(User $user, Student $student): bool
    {
        return $user->hasPermissionTo('update-student') || ($user->hasRole('Teacher') && $student->mentor_id === $user->id);
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->hasPermissionTo('delete-student') || ($user->hasRole('Teacher') && $student->mentor_id === $user->id);
    }

    public function dataStudent(User $user): bool
    {
        return $user->hasPermissionTo('data-student');
    }
}
