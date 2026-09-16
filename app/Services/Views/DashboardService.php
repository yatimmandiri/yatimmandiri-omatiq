<?php

namespace App\Services\Views;

use App\Http\Controllers\Teacher\BiodataController;
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
            'Cabang' => self::cabang($user),
            'Teacher' => self::teacher($user),
            'Participant' => self::participant($user),
            default => self::user(),
        };
    }

    private static function cabang(User $user): array
    {
        $branch = $user->getBranchName();

        $participantQuery = Participant::query();
        $studentQuery = Student::query()->where('is_binaan', true);
        $teacherQuery = User::role('Teacher');

        if (filled($branch)) {
            $participantQuery->where(function ($q) use ($branch) {
                $q->where('branch', $branch)
                    ->orWhere('branch', 'like', "%{$branch}%");
            });

            $studentQuery->where(function ($q) use ($branch) {
                $q->whereHas('participants', function ($pq) use ($branch) {
                    $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                })->orWhereHas('mentor', function ($mq) use ($branch) {
                    $mq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                });
            });

            $teacherQuery->where(function ($q) use ($branch) {
                $q->where('branch', $branch)
                    ->orWhere('branch', 'like', "%{$branch}%")
                    ->orWhereHas('participants', function ($pq) use ($branch) {
                        $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                    });
            });
        }

        $participantCount = (clone $participantQuery)->count();
        $verifiedParticipantCount = (clone $participantQuery)->where('status', 'verified')->count();
        $submittedParticipantCount = (clone $participantQuery)->where('status', 'submitted')->count();
        $teacherCount = $teacherQuery->count();
        $studentCount = $studentQuery->count();
        $olimpiadeCount = Olimpiade::count();

        $title = $branch ? "Dashboard Cabang {$branch}" : 'Dashboard Cabang';

        return [
            'view' => 'admin/dashboard/admin',
            'data' => [
                'pageTitle' => $title,
                'branchName' => $branch,
                'participantCount' => $participantCount,
                'verifiedParticipantCount' => $verifiedParticipantCount,
                'submittedParticipantCount' => $submittedParticipantCount,
                'teacherCount' => $teacherCount,
                'studentCount' => $studentCount,
                'olimpiadeCount' => $olimpiadeCount,
            ],
        ];
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
        $token = session('penyaluran_token') ?? $user->penyaluran_token;

        if ($token) {
            try {
                $penyaluran = app(PenyaluranService::class);
                $penyaluranProfile = $penyaluran->me($token);
                $sanggars = $penyaluran->sanggars($token);
                $penyaluranStudents = $penyaluran->students($token);
                $penyaluranTotal = count($penyaluranStudents);
                $sanggarCount = count($sanggars);
                $sanggarSum = collect($sanggars)->sum(fn ($s) => (int) ($s['total_students'] ?? 0));
                $overlap = $sanggarSum > $penyaluranTotal ? $sanggarSum - $penyaluranTotal : 0;
            } catch (\Throwable $e) {
                // fallback to local, keep null
            }
        }

        $registeredCount = Participant::query()
            ->where(function ($q) use ($user, $penyaluranStudents) {
                $q->where('mentor_id', $user->id)
                    ->orWhereHas('student', fn ($sq) => $sq->where('mentor_id', $user->id));

                $sessionIds = collect($penyaluranStudents)->pluck('student_id')->filter()->map(fn ($id) => (int) $id)->all();
                $sessionNiks = collect($penyaluranStudents)->pluck('nik')->filter()->all();

                if (! empty($sessionIds) || ! empty($sessionNiks)) {
                    $q->orWhereHas('student', function ($sq) use ($sessionIds, $sessionNiks) {
                        $sq->when(! empty($sessionIds), fn ($sub) => $sub->whereIn('penyaluran_id', $sessionIds))
                            ->when(! empty($sessionNiks), fn ($sub) => $sub->orWhereIn('nik', $sessionNiks));
                    });
                }
            })
            ->whereIn('status', ['submitted', 'verified'])
            ->count();

        // Kelengkapan biodata guru — HANYA dari Penyaluran (tidak simpan lokal)
        $biodata = self::guruBiodataFromPenyaluran($penyaluranProfile, $user);
        $biodataCompleteness = self::guruCompleteness($biodata);

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
                // Biodata guru — sumber tunggal Penyaluran
                'biodata' => $biodata,
                'biodataCompleteness' => $biodataCompleteness,
            ],
        ];
    }

    private static function guruBiodataFromPenyaluran(?array $profile, User $user): array
    {
        return BiodataController::extractTeacherBiodata($profile, $user);
    }

    private static function guruCompleteness(array $biodata): array
    {
        return BiodataController::completeness($biodata);
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
