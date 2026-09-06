<?php

namespace App\Services\Views;

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
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
                'participantCount' => Participant::count(),
                'verifiedParticipantCount' => Participant::where('status', 'verified')->count(),
                'submittedParticipantCount' => Participant::where('status', 'submitted')->count(),
                'teacherCount' => User::role('Teacher')->count(),
                'studentCount' => Student::where('is_binaan', true)->count(),
                'olimpiadeCount' => Olimpiade::count(),
            ],
        ];
    }

    private static function teacher(User $user): array
    {
        $studentCount = Student::where('mentor_id', $user->id)->where('is_binaan', true)->count();
        $penyaluranProfile = null;
        $sanggars = [];
        $penyaluranStudents = [];
        $penyaluranTotal = null;
        $sanggarCount = 0;
        $overlap = null;
        $sanggarSum = null;
        $registeredCount = Participant::query()
            ->where('mentor_id', $user->id)
            ->where('registration_type', 'teacher')
            ->whereIn('status', ['submitted', 'verified'])
            ->count();

        if ($user->penyaluran_token) {
            try {
                $penyaluran = app(PenyaluranService::class);
                $penyaluranProfile = $penyaluran->me($user->penyaluran_token);
                $sanggars = $penyaluran->sanggars($user->penyaluran_token);
                $penyaluranStudents = $penyaluran->students($user->penyaluran_token);
                $penyaluranTotal = count($penyaluranStudents);
                $sanggarCount = count($sanggars);
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
                'studentCount' => $studentCount,
                'penyaluranTotal' => $penyaluranTotal,
                'sanggarCount' => $sanggarCount,
                'sanggarSum' => $sanggarSum,
                'overlapCount' => $overlap,
                'penyaluranProfile' => $penyaluranProfile,
                'sanggars' => $sanggars,
                'penyaluranStudents' => array_slice($penyaluranStudents, 0, 5),
                'registeredCount' => $registeredCount,
            ],
        ];
    }

    private static function participant(User $user): array
    {
        $participant = $user->participant?->load([
            'olimpiade:id,name,category,slug,excerpt',
            'student:id,full_name,nickname,gender,birth_place,birth_date,school_name,school_level,nis,grade,address,province_id,regency_id,parent_phone,mentor_name,mentor_phone,photo_path,student_card_path',
            'student.province:id,name',
            'student.regency:id,name',
        ]);

        if ($participant) {
            $arr = $participant->toArray();
            $arr['payment_proof_url'] = $participant->payment_proof_url;
            $arr['student']['photo_url'] = $participant->student?->photo_url;
            $arr['student']['student_card_url'] = $participant->student?->student_card_url;
            $participant = $arr;
        }

        return [
            'view' => 'admin/dashboard/participant',
            'data' => [
                'pageTitle' => 'Dashboard Partisipan',
                'participant' => $participant,
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
