<?php

namespace App\Policies\Company;

use App\Models\Company\Participant;
use App\Models\Core\User;

class ParticipantPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->hasRole('Administrators')) {
            return $user->hasPermissionTo('view-participant');
        }

        if ($user->hasRole('Teacher')) {
            return $user->hasPermissionTo('view-participant');
        }

        return false;
    }

    public function view(User $user, Participant $participant): bool
    {
        if (! $user->hasPermissionTo('view-participant')) {
            return false;
        }

        if ($user->hasRole('Administrators')) {
            return true;
        }

        if ($user->hasRole('Teacher')) {
            if ($participant->mentor_id === $user->id || $participant->student?->mentor_id === $user->id) {
                return true;
            }
            $token = session('penyaluran_token') ?? $user->penyaluran_token;
            if ($token && $participant->student) {
                try {
                    $students = app(\App\Services\PenyaluranService::class)->students($token);
                    $sessionIds = collect($students)->pluck('student_id')->filter()->map(fn ($id) => (int) $id)->all();
                    $sessionNiks = collect($students)->pluck('nik')->filter()->all();
                    $penyaluranId = (int) ($participant->student->penyaluran_id ?? 0);
                    $nik = (string) ($participant->student->nik ?? '');

                    return ($penyaluranId && in_array($penyaluranId, $sessionIds, true))
                        || ($nik !== '' && in_array($nik, $sessionNiks, true));
                } catch (\Throwable $e) {
                }
            }

            return false;
        }

        return $user->participant?->id === $participant->id;
    }

    public function create(User $user): bool
    {
        if ($user->hasRole('Administrators')) {
            return $user->hasPermissionTo('create-participant');
        }

        if ($user->hasRole('Teacher')) {
            return $user->hasPermissionTo('create-participant');
        }

        return false;
    }

    public function update(User $user, Participant $participant): bool
    {
        if (! $user->hasPermissionTo('update-participant')) {
            return false;
        }

        if ($user->hasRole('Administrators')) {
            return true;
        }

        if ($user->hasRole('Teacher')) {
            return $participant->mentor_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, Participant $participant): bool
    {
        if (! $user->hasPermissionTo('delete-participant')) {
            return false;
        }

        if ($user->hasRole('Administrators')) {
            return true;
        }

        if ($user->hasRole('Teacher')) {
            if ($participant->mentor_id === $user->id || $participant->student?->mentor_id === $user->id) {
                return true;
            }
            $token = session('penyaluran_token') ?? $user->penyaluran_token;
            if ($token && $participant->student) {
                try {
                    $students = app(\App\Services\PenyaluranService::class)->students($token);
                    $sessionIds = collect($students)->pluck('student_id')->filter()->map(fn ($id) => (int) $id)->all();
                    $sessionNiks = collect($students)->pluck('nik')->filter()->all();
                    $penyaluranId = (int) ($participant->student->penyaluran_id ?? 0);
                    $nik = (string) ($participant->student->nik ?? '');

                    return ($penyaluranId && in_array($penyaluranId, $sessionIds, true))
                        || ($nik !== '' && in_array($nik, $sessionNiks, true));
                } catch (\Throwable $e) {
                }
            }

            return false;
        }

        return false;
    }

    public function dataParticipant(User $user): bool
    {
        if ($user->hasRole('Administrators')) {
            return $user->hasPermissionTo('data-participant');
        }

        if ($user->hasRole('Teacher')) {
            return $user->hasPermissionTo('data-participant');
        }

        return false;
    }

    public function syncSheet(User $user): bool
    {
        return $user->hasRole('Administrators') && $user->hasPermissionTo('update-participant');
    }
}
