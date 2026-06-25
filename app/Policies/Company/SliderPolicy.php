<?php

namespace App\Policies\Company;

use App\Models\Company\Slider;
use App\Models\Core\User;

class SliderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-slider');
    }

    public function view(User $user, Slider $slider): bool
    {
        return $user->hasPermissionTo('view-slider');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-slider');
    }

    public function update(User $user, Slider $slider): bool
    {
        return $user->hasPermissionTo('update-slider');
    }

    public function delete(User $user, Slider $slider): bool
    {
        return $user->hasPermissionTo('delete-slider');
    }

    public function dataSlider(User $user): bool
    {
        return $user->hasPermissionTo('data-slider');
    }
}
