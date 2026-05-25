<?php

namespace App\Policies\Core;

use App\Models\Core\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     *
     * This policy checks if the user has the 'view-user' permission.
     * If the user has this permission, they can view all users.
     *
     * @param  User  $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-user');
    }

    /**
     * Determine whether the user can view the given user.
     *
     * This policy checks if the user has the 'view-user' permission.
     * If the user has this permission, they can view all users.
     *
     * @param  User  $user
     * @param  User  $model
     * @return bool
     */
    public function view(User $model, User $user): bool
    {
        // Check if the user has the 'view-user' permission
        return $model->hasPermissionTo('view-user');
    }

    /**
     * Determine whether the user can create models.
     *
     * This policy checks if the user has the 'create-user' permission.
     * If the user has this permission, they can create new users.
     *
     * @param  User  $user
     * @return bool
     */
    public function create(User $model): bool
    {
        // Check if the user has the 'create-user' permission
        return $model->hasPermissionTo('create-user');
    }

    /**
     * Determine whether the user can update the model.
     *
     * This policy checks if the user has the 'update-user' permission.
     * If the user has this permission, they can update any user.
     *
     * @param  User  $user
     * @param  User  $model
     * @return bool
     */
    public function update(User $model, User $user): bool
    {
        // Check if the user has the 'update-user' permission
        return $model->hasPermissionTo('update-user');
    }

    /**
     * Determine whether the user can delete the given user.
     *
     * This policy checks if the user has the 'delete-user' permission.
     * If the user has this permission, they can delete any user.
     *
     * @param  User  $user
     * @param  User  $model
     * @return bool
     */
    public function delete(User $model, User $user): bool
    {
        // Check if the user has the 'delete-user' permission
        return $model->hasPermissionTo('delete-user');
    }

    /**
     * Determine whether the user can restore the given user.
     *
     * This policy checks if the user has the 'restore-user' permission.
     * If the user has this permission, they can restore any user.
     *
     * @param  User  $user
     * @param  User  $model
     * @return bool
     */
    public function restore(User $model, User $user): bool
    {
        // Check if the user has the 'restore-user' permission
        // If the user has this permission, they can restore any user
        return $model->hasPermissionTo('restore-user');
    }

    /**
     * Determine whether the user can permanently delete the given user.
     *
     * This policy checks if the user has the 'force-delete-user' permission.
     * If the user has this permission, they can permanently delete any user.
     *
     * @param  User  $user
     * @param  User  $model
     * @return bool
     */
    public function forceDelete(User $model, User $user): bool
    {
        // Check if the user has the 'force-delete-user' permission
        // If the user has this permission, they can permanently delete any user
        return $model->hasPermissionTo('force-delete-user');
    }

    /**
     * Determine whether the user can view the data of the given user.
     *
     * This policy checks if the user has the 'data-user' permission.
     * If the user has this permission, they can view the data of any user.
     *
     * @param  User  $user
     * @param  User  $model
     * @return bool
     */
    public function getData(User $model, User $user): bool
    {
        // Check if the user has the 'data-user' permission
        // If the user has this permission, they can view the data of any user
        return $model->hasPermissionTo('data-user');
    }

    public function bulk(User $model, User $user): bool
    {
        // Check if the user has the 'bulk-data-user' permission
        // If the user has this permission, they can update the data of any user
        return $model->hasPermissionTo('bulk-user');
    }

    public function reportDonatur(User $model, User $user): bool
    {
        // Check if the user has the 'update-data-user' permission
        // If the user has this permission, they can update the data of any user
        return $model->hasPermissionTo('view-donatur-report');
    }
}
