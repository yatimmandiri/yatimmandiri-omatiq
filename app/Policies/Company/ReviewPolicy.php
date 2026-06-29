<?php

namespace App\Policies\Company;

use App\Models\Company\Review;
use App\Models\Core\User;

class ReviewPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-review');
    }

    public function view(User $user, Review $review): bool
    {
        return $user->hasPermissionTo('view-review');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-review');
    }

    public function update(User $user, Review $review): bool
    {
        return $user->hasPermissionTo('update-review');
    }

    public function delete(User $user, Review $review): bool
    {
        return $user->hasPermissionTo('delete-review');
    }

    public function dataReview(User $user): bool
    {
        return $user->hasPermissionTo('data-review');
    }
}
