<?php

namespace App\Policies\Company;

use App\Models\Company\Participant;
use App\Models\Core\User;

class ParticipantPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->hasRole('Administrators')) {
            return $user->hasPermissionTo('view-participant');
        }

        if ($user->hasRole('Teacher')) {
            return $user->hasPermissionTo('view-participant');
        }

        return false;
    }

    public function view(User $user, Participant $participant): bool
    {
        if (! $user->hasPermissionTo('view-participant')) {
            return false;
        }

        if ($user->hasRole('Administrators')) {
            return true;
        }

        if ($user->hasRole('Teacher')) {
            return $participant->mentor_id === $user->id;
        }

        return $user->participant?->id === $participant->id;
    }

    public function create(User $user): bool
    {
        if ($user->hasRole('Administrators')) {
            return $user->hasPermissionTo('create-participant');
        }

        if ($user->hasRole('Teacher')) {
            return $user->hasPermissionTo('create-participant');
        }

        return false;
    }

    public function update(User $user, Participant $participant): bool
    {
        if (! $user->hasPermissionTo('update-participant')) {
            return false;
        }

        if ($user->hasRole('Administrators')) {
            return true;
        }

        if ($user->hasRole('Teacher')) {
            return $participant->mentor_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, Participant $participant): bool
    {
        if (! $user->hasPermissionTo('delete-participant')) {
            return false;
        }

        if ($user->hasRole('Administrators')) {
            return true;
        }

        if ($user->hasRole('Teacher')) {
            return $participant->mentor_id === $user->id;
        }

        return false;
    }

    public function dataParticipant(User $user): bool
    {
        if ($user->hasRole('Administrators')) {
            return $user->hasPermissionTo('data-participant');
        }

        if ($user->hasRole('Teacher')) {
            return $user->hasPermissionTo('data-participant');
        }

        return false;
    }
}
