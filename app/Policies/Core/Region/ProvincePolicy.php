<?php

namespace App\Policies\Core\Region;

use App\Models\Core\Region\Province;
use App\Models\Core\User;

class ProvincePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-province');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Province $province): bool
    {
        return $user->hasPermissionTo('view-province');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-province');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Province $province): bool
    {
        return $user->hasPermissionTo('update-province');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Province $province): bool
    {
        return $user->hasPermissionTo('delete-province');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Province $province): bool
    {
        return $user->hasPermissionTo('restore-province');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Province $province): bool
    {
        return $user->hasPermissionTo('force-delete-province');
    }

    /**
     * Determine whether the user can permanently getData the model.
     */
    public function getData(User $user, Province $province): bool
    {
        return $user->hasPermissionTo('data-province');
    }
}
