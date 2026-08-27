<?php

namespace App\Services\Views;

use App\Models\Company\Participant;
use App\Models\Core\User;
use App\Services\PenyaluranService;

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
        $penyaluranProfile = null;
        $sanggars = [];
        $penyaluranStudents = [];
        $penyaluranTotal = null;

        $overlap = null;
        $sanggarSum = null;

        if ($user->penyaluran_token) {
            try {
                $penyaluran = app(PenyaluranService::class);
                $penyaluranProfile = $penyaluran->me($user->penyaluran_token);
                $sanggars = $penyaluran->sanggars($user->penyaluran_token);
                $penyaluranStudents = $penyaluran->students($user->penyaluran_token);
                $penyaluranTotal = count($penyaluranStudents);
                $sanggarSum = collect($sanggars)->sum(fn ($s) => (int) ($s['total_students'] ?? 0));
                $overlap = $sanggarSum > $penyaluranTotal ? $sanggarSum - $penyaluranTotal : 0;
            } catch (\Throwable $e) {
                // fallback to local, keep null
            }
        }

        return [
            'view' => 'admin/dashboard/teacher',
            'data' => [
                'pageTitle' => 'Dashboard Guru',
                'studentCount' => $penyaluranTotal ?? $studentCount,
                'sanggarSum' => $sanggarSum,
                'overlapCount' => $overlap,
                'penyaluranProfile' => $penyaluranProfile,
                'sanggars' => $sanggars,
                'penyaluranStudents' => array_slice($penyaluranStudents, 0, 5),
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
                    'student:id,full_name,nickname,gender,birth_place,birth_date,age,school_name,grade,address,province_id,regency_id,parent_phone,mentor_name,mentor_phone,photo_path,identity_card_path,family_card_path,student_card_path',
                    'student.province:id,name',
                    'student.regency:id,name',
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
