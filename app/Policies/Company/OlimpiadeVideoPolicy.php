<?php

namespace App\Policies\Company;

use App\Models\Company\OlimpiadeVideo;
use App\Models\Core\User;

class OlimpiadeVideoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-olimpiade-video');
    }

    public function view(User $user, OlimpiadeVideo $video): bool
    {
        return $user->hasPermissionTo('view-olimpiade-video');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-olimpiade-video');
    }

    public function update(User $user, OlimpiadeVideo $video): bool
    {
        return $user->hasPermissionTo('update-olimpiade-video');
    }

    public function delete(User $user, OlimpiadeVideo $video): bool
    {
        return $user->hasPermissionTo('delete-olimpiade-video');
    }

    public function dataOlimpiadeVideo(User $user): bool
    {
        return $user->hasPermissionTo('data-olimpiade-video');
    }
}
