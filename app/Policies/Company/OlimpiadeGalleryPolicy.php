<?php

namespace App\Policies\Company;

use App\Models\Company\OlimpiadeGallery;
use App\Models\Core\User;

class OlimpiadeGalleryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-olimpiade-gallery');
    }

    public function view(User $user, OlimpiadeGallery $gallery): bool
    {
        return $user->hasPermissionTo('view-olimpiade-gallery');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-olimpiade-gallery');
    }

    public function update(User $user, OlimpiadeGallery $gallery): bool
    {
        return $user->hasPermissionTo('update-olimpiade-gallery');
    }

    public function delete(User $user, OlimpiadeGallery $gallery): bool
    {
        return $user->hasPermissionTo('delete-olimpiade-gallery');
    }

    public function dataOlimpiadeGallery(User $user): bool
    {
        return $user->hasPermissionTo('data-olimpiade-gallery');
    }
}
