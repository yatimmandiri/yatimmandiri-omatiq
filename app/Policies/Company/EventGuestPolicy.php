<?php

namespace App\Policies\Company;

use App\Models\Company\EventGuest;
use App\Models\Core\User;

class EventGuestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('Administrators');
    }

    public function view(User $user, EventGuest $guest): bool
    {
        return $user->hasRole('Administrators');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Administrators');
    }

    public function update(User $user, EventGuest $guest): bool
    {
        return $user->hasRole('Administrators');
    }

    public function delete(User $user, EventGuest $guest): bool
    {
        return $user->hasRole('Administrators');
    }
}
