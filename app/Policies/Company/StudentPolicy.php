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
        return $user->hasPermissionTo('view-student');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-student');
    }

    public function update(User $user, Student $student): bool
    {
        return $user->hasPermissionTo('update-student');
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->hasPermissionTo('delete-student');
    }

    public function dataStudent(User $user): bool
    {
        return $user->hasPermissionTo('data-student');
    }
}
