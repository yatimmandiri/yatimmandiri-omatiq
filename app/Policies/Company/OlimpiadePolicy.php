<?php

namespace App\Policies\Company;

use App\Models\Company\Olimpiade;
use App\Models\Core\User;

class OlimpiadePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-olimpiade');
    }

    public function view(User $user, Olimpiade $olimpiade): bool
    {
        return $user->hasPermissionTo('view-olimpiade');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-olimpiade');
    }

    public function update(User $user, Olimpiade $olimpiade): bool
    {
        return $user->hasPermissionTo('update-olimpiade');
    }

    public function delete(User $user, Olimpiade $olimpiade): bool
    {
        return $user->hasPermissionTo('delete-olimpiade');
    }

    public function restore(User $user, Olimpiade $olimpiade): bool
    {
        return $user->hasPermissionTo('restore-olimpiade');
    }

    public function forceDelete(User $user, Olimpiade $olimpiade): bool
    {
        return $user->hasPermissionTo('force-delete-olimpiade');
    }

    public function dataOlimpiade(User $user): bool
    {
        return $user->hasPermissionTo('data-olimpiade');
    }
}
