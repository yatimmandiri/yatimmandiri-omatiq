<?php

namespace App\Policies\Company;

use App\Models\Company\Period;
use App\Models\Core\User;

class PeriodPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-period');
    }

    public function view(User $user, Period $period): bool
    {
        return $user->hasPermissionTo('view-period');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-period');
    }

    public function update(User $user, Period $period): bool
    {
        return $user->hasPermissionTo('update-period');
    }

    public function delete(User $user, Period $period): bool
    {
        return $user->hasPermissionTo('delete-period');
    }

    public function dataPeriod(User $user): bool
    {
        return $user->hasPermissionTo('data-period');
    }
}
