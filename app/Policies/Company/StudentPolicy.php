<?php

namespace App\Policies\Company;

use App\Models\Company\Student;
use App\Models\Core\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->hasRole('Administrators') || $user->hasRole('Cabang')) {
            return true;
        }

        return $user->hasPermissionTo('view-student');
    }

    public function view(User $user, Student $student): bool
    {
        if ($user->hasRole('Administrators')) {
            return true;
        }

        if ($user->hasRole('Cabang')) {
            $branch = $user->getBranchName();
            if (filled($branch)) {
                $hasBranchParticipant = $student->participants()->where(function ($pq) use ($branch) {
                    $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                })->exists();
                $mentorBranch = $student->mentor?->getBranchName();

                return $hasBranchParticipant || ($mentorBranch && stripos($mentorBranch, $branch) !== false);
            }

            return true;
        }

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
        if ($user->hasRole('Administrators') || $user->hasRole('Cabang')) {
            return true;
        }

        return $user->hasPermissionTo('data-student');
    }
}

