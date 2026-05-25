<?php

namespace App\Policies\Core;

use App\Models\Core\Role;
use App\Models\Core\User;

class RolePolicy
{
    /**
     * Determine whether the user can view any models.
     *
     * This policy checks if the user has the 'view-role' permission.
     * If the user has this permission, they can view all roles.
     *
     * @param  User  $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-role');
    }

    /**
     * Determine whether the user can view the role.
     *
     * This policy checks if the user has the 'view-role' permission.
     * If the user has this permission, they can view all roles.
     *
     * @param User $user
     * @param Role $role
     * @return bool
     */
    public function view(User $user, Role $role): bool
    {
        // Check if the user has the 'view-role' permission
        return $user->hasPermissionTo('view-role');
    }

    /**
     * Determine whether the user can create models.
     *
     * This policy checks if the user has the 'create-role' permission.
     * If the user has this permission, they can create new roles.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        // Check if the user has the 'create-role' permission
        return $user->hasPermissionTo('create-role');
    }

    /**
     * Determine whether the user can update the role.
     *
     * This policy checks if the user has the 'update-role' permission.
     * If the user has this permission, they can update any role.
     *
     * @param User $user
     * @param Role $role
     * @return bool
     */
    public function update(User $user, Role $role): bool
    {
        // Check if the user has the 'update-role' permission
        return $user->hasPermissionTo('update-role');
    }

    /**
     * Determine whether the user can delete the role.
     *
     * This policy checks if the user has the 'delete-role' permission.
     * If the user has this permission, they can delete any role.
     *
     * @param User $user The user to check
     * @param Role $role The role to check
     * @return bool Whether the user can delete the role
     */
    public function delete(User $user, Role $role): bool
    {
        // Check if the user has the 'delete-role' permission
        // If the user has this permission, they can delete any role
        return $user->hasPermissionTo('delete-role');
    }

    /**
     * Determine whether the user can restore the role.
     *
     * This policy checks if the user has the 'restore-role' permission.
     * If the user has this permission, they can restore any role.
     *
     * @param User $user The user to check
     * @param Role $role The role to check
     * @return bool Whether the user can restore the role
     */
    public function restore(User $user, Role $role): bool
    {
        // Check if the user has the 'restore-role' permission
        // If the user has this permission, they can restore any role
        return $user->hasPermissionTo('restore-role');
    }

    /**
     * Determine whether the user can permanently delete the role.
     *
     * This policy checks if the user has the 'force-delete-role' permission.
     * If the user has this permission, they can permanently delete any role.
     *
     * @param User $user
     * @param Role $role
     * @return bool
     */
    public function forceDelete(User $user, Role $role): bool
    {
        // Check if the user has the 'force-delete-role' permission
        return $user->hasPermissionTo('force-delete-role');
    }

    /**
     * Determine whether the user can view the data of the role.
     *
     * This policy checks if the user has the 'data-role' permission.
     * If the user has this permission, they can view the data of any role.
     *
     * @param  User  $user
     * @param  Role  $role
     * @return bool
     */
    public function getData(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('data-role');
    }
}
