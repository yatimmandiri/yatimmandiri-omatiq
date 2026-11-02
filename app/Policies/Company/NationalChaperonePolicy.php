<?php

namespace App\Policies\Company;

use App\Models\Company\NationalChaperone;
use App\Models\Core\User;

class NationalChaperonePolicy
{
    private function resolveBranch(?User $user): ?string
    {
        if (! $user) {
            return null;
        }

        $rawBranch = $user->getBranchName() ?? $user->branch;
        if (filled($rawBranch)) {
            $clean = trim(preg_replace('/^(user\s+)?(kantor\s+)?(layanan\s+)?cabang\s+/i', '', (string) $rawBranch));
            $clean = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', (string) $clean));

            return $clean !== '' ? $clean : null;
        }

        if ($user->hasRole('Cabang')) {
            $clean = trim(preg_replace('/^(user\s+)?(kantor\s+)?(layanan\s+)?cabang\s+/i', '', (string) $user->name));
            $clean = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', (string) $clean));

            return $clean !== '' ? $clean : null;
        }

        return null;
    }

    private function matchesBranch(User $user, NationalChaperone $chaperone): bool
    {
        if ($user->hasRole('Administrators')) {
            return true;
        }

        if (! $user->hasRole('Cabang')) {
            return false;
        }

        if ($user->kantor_id && $chaperone->kantor_id && (int) $user->kantor_id === (int) $chaperone->kantor_id) {
            return true;
        }

        $userBranch = $this->resolveBranch($user);
        if (filled($userBranch) && filled($chaperone->branch)) {
            return stripos($chaperone->branch, $userBranch) !== false
                || stripos($userBranch, $chaperone->branch) !== false;
        }

        return $chaperone->created_by === $user->id;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Administrators', 'Cabang']);
    }

    public function view(User $user, NationalChaperone $chaperone): bool
    {
        return $this->matchesBranch($user, $chaperone);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Administrators', 'Cabang']);
    }

    public function update(User $user, NationalChaperone $chaperone): bool
    {
        if ($user->hasRole('Administrators')) {
            return true;
        }

        if ($chaperone->status === 'verified') {
            return false;
        }

        return $this->matchesBranch($user, $chaperone);
    }

    public function delete(User $user, NationalChaperone $chaperone): bool
    {
        if ($user->hasRole('Administrators')) {
            return true;
        }

        if ($chaperone->status === 'verified') {
            return false;
        }

        return $this->matchesBranch($user, $chaperone);
    }

    public function verify(User $user): bool
    {
        return $user->hasRole('Administrators');
    }
}
