<?php

namespace App\Policies\Company;

use App\Models\Company\EventCommittee;
use App\Models\Core\User;

class EventCommitteePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('Administrators');
    }

    public function view(User $user, EventCommittee $committee): bool
    {
        return $user->hasRole('Administrators');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Administrators');
    }

    public function update(User $user, EventCommittee $committee): bool
    {
        return $user->hasRole('Administrators');
    }

    public function delete(User $user, EventCommittee $committee): bool
    {
        return $user->hasRole('Administrators');
    }
}
