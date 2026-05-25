<?php

namespace App\Policies\Core;

use App\Models\Core\LogActivity;
use App\Models\Core\User;

class LogActivityPolicy
{
    /**
     * Determine whether the user can view any models.
     *
     * This policy checks if the user has the 'view-log-activity' permission.
     * If the user has this permission, they can view all LogActivitys.
     *
     * @param  User  $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-log-activity');
    }

    /**
     * Determine whether the user can view the LogActivity.
     *
     * This policy checks if the user has the 'view-log-activity' permission.
     * If the user has this permission, they can view all LogActivitys.
     *
     * @param User $user
     * @param LogActivity $LogActivity
     * @return bool
     */
    public function view(User $user, LogActivity $LogActivity): bool
    {
        // Check if the user has the 'view-log-activity' permission
        return $user->hasPermissionTo('view-log-activity');
    }

    /**
     * Determine whether the user can create models.
     *
     * This policy checks if the user has the 'create-log-activity' permission.
     * If the user has this permission, they can create new LogActivitys.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        // Check if the user has the 'create-log-activity' permission
        return $user->hasPermissionTo('create-log-activity');
    }

    /**
     * Determine whether the user can update the LogActivity.
     *
     * This policy checks if the user has the 'update-log-activity' permission.
     * If the user has this permission, they can update any LogActivity.
     *
     * @param User $user
     * @param LogActivity $LogActivity
     * @return bool
     */
    public function update(User $user, LogActivity $LogActivity): bool
    {
        // Check if the user has the 'update-log-activity' permission
        return $user->hasPermissionTo('update-log-activity');
    }

    /**
     * Determine whether the user can delete the LogActivity.
     *
     * This policy checks if the user has the 'delete-log-activity' permission.
     * If the user has this permission, they can delete any LogActivity.
     *
     * @param User $user The user to check
     * @param LogActivity $LogActivity The LogActivity to check
     * @return bool Whether the user can delete the LogActivity
     */
    public function delete(User $user, LogActivity $LogActivity): bool
    {
        // Check if the user has the 'delete-log-activity' permission
        // If the user has this permission, they can delete any LogActivity
        return $user->hasPermissionTo('delete-log-activity');
    }

    /**
     * Determine whether the user can restore the LogActivity.
     *
     * This policy checks if the user has the 'restore-log-activity' permission.
     * If the user has this permission, they can restore any LogActivity.
     *
     * @param User $user The user to check
     * @param LogActivity $LogActivity The LogActivity to check
     * @return bool Whether the user can restore the LogActivity
     */
    public function restore(User $user, LogActivity $LogActivity): bool
    {
        // Check if the user has the 'restore-log-activity' permission
        // If the user has this permission, they can restore any LogActivity
        return $user->hasPermissionTo('restore-log-activity');
    }

    /**
     * Determine whether the user can permanently delete the LogActivity.
     *
     * This policy checks if the user has the 'force-delete-log-activity' permission.
     * If the user has this permission, they can permanently delete any LogActivity.
     *
     * @param User $user
     * @param LogActivity $LogActivity
     * @return bool
     */
    public function forceDelete(User $user, LogActivity $LogActivity): bool
    {
        // Check if the user has the 'force-delete-log-activity' permission
        return $user->hasPermissionTo('force-delete-log-activity');
    }

    /**
     * Determine whether the user can view the data of the LogActivity.
     *
     * This policy checks if the user has the 'data-log-activity' permission.
     * If the user has this permission, they can view the data of any LogActivity.
     *
     * @param  User  $user
     * @param  LogActivity  $LogActivity
     * @return bool
     */
    public function getData(User $user, LogActivity $LogActivity): bool
    {
        return $user->hasPermissionTo('data-log-activity');
    }
}
