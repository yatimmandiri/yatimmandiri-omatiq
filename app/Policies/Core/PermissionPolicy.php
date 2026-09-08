<?php

namespace App\Policies\Core;

use App\Models\Core\Permission;
use App\Models\Core\User;

class PermissionPolicy
{
    /**
     * Determine whether the user can view any permissions.
     *
     * This policy checks if the user has the 'view-permission' permission.
     * If the user has this permission, they can view all permissions.
     *
     * @return bool
     *              Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-permission');
    }

    /**
     * Determine whether the user can view the model.
     *
     * This policy checks if the user has the 'view-permission' permission.
     */
    public function view(User $user, Permission $permission): bool
    {
        // Check if the user has the 'view-permission' permission
        return $user->hasPermissionTo('view-permission');
    }

    /**
     * Determine whether the user can create models.
     *
     * This policy checks if the user has the 'create-permission' permission.
     */
    public function create(User $user): bool
    {
        // Check if the user has the 'create-permission' permission
        return $user->hasPermissionTo('create-permission');
    }

    /**
     * Determine whether the user can update the model.
     *
     * This policy checks if the user has the 'update-permission' permission.
     */
    public function update(User $user, Permission $permission): bool
    {
        /**
         * Check if the user has 'update-permission' permission
         *
         * @return bool
         */
        return $user->hasPermissionTo('update-permission');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Permission $permission): bool
    {
        /**
         * Check if the user has 'delete-permission' permission
         *
         * @return bool
         */
        return $user->hasPermissionTo('delete-permission');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Permission $permission): bool
    {
        return $user->hasPermissionTo('restore-permission');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Permission $permission): bool
    {
        return $user->hasPermissionTo('force-delete-permission');
    }

    /**
     * Determine whether the user can view the data of the model.
     */
    public function getData(User $user, Permission $permission): bool
    {
        return $user->hasPermissionTo('data-permission');
    }
}
