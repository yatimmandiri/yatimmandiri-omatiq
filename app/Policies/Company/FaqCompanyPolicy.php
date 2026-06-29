<?php

namespace App\Policies\Company;

use App\Models\Company\FaqCompany;
use App\Models\Core\User;

class FaqCompanyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-faq-company');
    }

    public function view(User $user, FaqCompany $faqCompany): bool
    {
        return $user->hasPermissionTo('view-faq-company');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create-faq-company');
    }

    public function update(User $user, FaqCompany $faqCompany): bool
    {
        return $user->hasPermissionTo('update-faq-company');
    }

    public function delete(User $user, FaqCompany $faqCompany): bool
    {
        return $user->hasPermissionTo('delete-faq-company');
    }

    public function dataFaqCompany(User $user): bool
    {
        return $user->hasPermissionTo('data-faq-company');
    }
}
