<?php

namespace App\Policies\Company;

use App\Models\Company\Participant;
use App\Models\Core\User;

class ParticipantPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-participant');
    }

    public function view(User $user, Participant $participant): bool
    {
        return $user->hasPermissionTo('view-participant');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-participant');
    }

    public function update(User $user, Participant $participant): bool
    {
        return $user->hasPermissionTo('update-participant');
    }

    public function delete(User $user, Participant $participant): bool
    {
        return $user->hasPermissionTo('delete-participant');
    }

    public function dataParticipant(User $user): bool
    {
        return $user->hasPermissionTo('data-participant');
    }
}
