<?php

namespace App\Policies\Company;

use App\Models\Company\Testimonial;
use App\Models\Core\User;

class TestimonialPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-testimonial');
    }

    public function view(User $user, Testimonial $testimonial): bool
    {
        return $user->hasPermissionTo('view-testimonial');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-testimonial');
    }

    public function update(User $user, Testimonial $testimonial): bool
    {
        return $user->hasPermissionTo('update-testimonial');
    }

    public function delete(User $user, Testimonial $testimonial): bool
    {
        return $user->hasPermissionTo('delete-testimonial');
    }

    public function dataTestimonial(User $user): bool
    {
        return $user->hasPermissionTo('data-testimonial');
    }
}
