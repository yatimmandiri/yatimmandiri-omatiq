<?php

namespace App\Services\Views;

use App\Models\Company\Participant;
use App\Models\Core\User;

class DashboardService
{
    public static function handle(User $user): array
    {
        $role = $user->getRoleNames()->first();

        return match ($role) {
            'Administrators' => self::admin(),
            'Teacher' => self::teacher($user),
            'Participant' => self::participant($user),
            default => self::user(),
        };
    }

    private static function admin(): array
    {
        return [
            'view' => 'admin/dashboard/admin',
            'data' => [
                'pageTitle' => 'Dashboard Admin',
            ],
        ];
    }

    private static function teacher(User $user): array
    {
        $studentCount = Participant::where('mentor_id', $user->id)->count();

        return [
            'view' => 'admin/dashboard/teacher',
            'data' => [
                'pageTitle' => 'Dashboard Guru',
                'studentCount' => $studentCount,
            ],
        ];
    }

    private static function participant(User $user): array
    {
        $participant = $user->participant;

        return [
            'view' => 'admin/dashboard/participant',
            'data' => [
                'pageTitle' => 'Dashboard Partisipan',
                'participant' => $participant?->load([
                    'olimpiade:id,name,category,slug,excerpt',
                    'province:id,name',
                    'regency:id,name',
                ]),
            ],
        ];
    }

    private static function user(): array
    {
        return [
            'view' => 'admin/dashboard/user',
            'data' => [
                'pageTitle' => 'Dashboard User',
            ],
        ];
    }
}
