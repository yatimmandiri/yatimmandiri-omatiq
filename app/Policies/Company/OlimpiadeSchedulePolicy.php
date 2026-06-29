<?php

namespace App\Policies\Company;

use App\Models\Company\OlimpiadeSchedule;
use App\Models\Core\User;

class OlimpiadeSchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-olimpiade-schedule');
    }

    public function view(User $user, OlimpiadeSchedule $olimpiadeSchedule): bool
    {
        return $user->hasPermissionTo('view-olimpiade-schedule');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-olimpiade-schedule');
    }

    public function update(User $user, OlimpiadeSchedule $olimpiadeSchedule): bool
    {
        return $user->hasPermissionTo('update-olimpiade-schedule');
    }

    public function delete(User $user, OlimpiadeSchedule $olimpiadeSchedule): bool
    {
        return $user->hasPermissionTo('delete-olimpiade-schedule');
    }

    public function dataOlimpiadeSchedule(User $user): bool
    {
        return $user->hasPermissionTo('data-olimpiade-schedule');
    }
}
