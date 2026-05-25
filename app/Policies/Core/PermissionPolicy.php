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
     * @param  User  $user
     * @return bool
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-permission');
    }

    /**
     * Determine whether the user can view the model.
     *
     * This policy checks if the user has the 'view-permission' permission.
     *
     * @param  User  $user
     * @param  Permission  $permission
     * @return bool
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
     *
     * @param  User  $user
     * @return bool
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
     *
     * @param  User  $user
     * @param  Permission  $permission
     * @return bool
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
     *
     * @param  User  $user
     * @param  Permission  $permission
     * @return bool
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
     *
     * @param  User  $user
     * @param  Permission  $permission
     * @return bool
     */
    public function restore(User $user, Permission $permission): bool
    {
        return $user->hasPermissionTo('restore-permission');
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  User  $user
     * @param  Permission  $permission
     * @return bool
     */
    public function forceDelete(User $user, Permission $permission): bool
    {
        return $user->hasPermissionTo('force-delete-permission');
    }

    /**
     * Determine whether the user can view the data of the model.
     *
     * @param  User  $user
     * @param  Permission  $permission
     * @return bool
     */
    public function getData(User $user, Permission $permission): bool
    {
        return $user->hasPermissionTo('data-permission');
    }
}
