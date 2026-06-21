<?php

namespace App\Policies\Company;

use App\Models\Company\OlimpiadeObjective;
use App\Models\Core\User;

class OlimpiadeObjectivePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-olimpiade-objective');
    }

    public function view(User $user, OlimpiadeObjective $objective): bool
    {
        return $user->hasPermissionTo('view-olimpiade-objective');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-olimpiade-objective');
    }

    public function update(User $user, OlimpiadeObjective $objective): bool
    {
        return $user->hasPermissionTo('update-olimpiade-objective');
    }

    public function delete(User $user, OlimpiadeObjective $objective): bool
    {
        return $user->hasPermissionTo('delete-olimpiade-objective');
    }

    public function dataOlimpiadeObjective(User $user): bool
    {
        return $user->hasPermissionTo('data-olimpiade-objective');
    }
}
