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

    private static function resolveBranch(?User $user): ?string
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

    private static function cabang(User $user): array
    {
        $branch = self::resolveBranch($user);
        $userKantorId = $user->kantor_id;
        $penyaluran = app(PenyaluranService::class);

        $participantQuery = Participant::query();

        if (filled($branch)) {
            $participantQuery->where(function ($q) use ($branch) {
                $q->where('branch', $branch)
                    ->orWhere('branch', 'like', "%{$branch}%");
            });
        }

        $participantCount = (clone $participantQuery)->count();
        $verifiedParticipantCount = (clone $participantQuery)->where('status', 'verified')->count();
        $submittedParticipantCount = (clone $participantQuery)->where('status', 'submitted')->count();

        // 1. Teachers count for branch from Penyaluran API (fallback to local DB)
        $teacherCount = 0;
        try {
            $queryParams = [];
            if ($userKantorId) {
                $queryParams['kantor_id'] = $userKantorId;
            }
            $apiTeachers = $penyaluran->allTeachers($queryParams);
            if (empty($apiTeachers) && ! empty($queryParams)) {
                $apiTeachers = $penyaluran->allTeachers();
            }

            if (! empty($apiTeachers)) {
                $teachersCol = collect($apiTeachers);
                if (filled($branch)) {
                    $branchLower = strtolower($branch);
                    $teachersCol = $teachersCol->filter(function (array $t) use ($branchLower, $userKantorId) {
                        if ($userKantorId && ! empty($t['kantor_id']) && (int) $t['kantor_id'] === (int) $userKantorId) {
                            return true;
                        }

                        $kantor = strtolower(trim((string) ($t['kantor_name'] ?? $t['branch'] ?? '')));
                        if ($kantor !== '') {
                            $cleanKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $kantor));
                            $cleanKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanKantor));
                            if (str_contains($kantor, $branchLower) || str_contains($branchLower, $cleanKantor)) {
                                return true;
                            }
                        }

                        $sanggars = $t['sanggars'] ?? [];
                        if (is_array($sanggars) && ! empty($sanggars)) {
                            foreach ($sanggars as $s) {
                                if (! is_array($s)) {
                                    continue;
                                }
                                if ($userKantorId && ! empty($s['kantor_id']) && (int) $s['kantor_id'] === (int) $userKantorId) {
                                    return true;
                                }
                                $sKantor = strtolower(trim((string) ($s['kantor_name'] ?? $s['kantor'] ?? $s['cabang'] ?? '')));
                                if ($sKantor !== '') {
                                    $cleanSKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $sKantor));
                                    $cleanSKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanSKantor));
                                    if (str_contains($sKantor, $branchLower) || str_contains($branchLower, $cleanSKantor)) {
                                        return true;
                                    }
                                }
                            }
                        }

                        return false;
                    });
                }
                $teacherCount = $teachersCol->unique('id')->count();
            }
        } catch (\Throwable $e) {
            $teacherCount = 0;
        }

        if ($teacherCount === 0) {
            $teacherQuery = User::role('Teacher');
            if (filled($branch)) {
                $teacherQuery->where(function ($q) use ($branch) {
                    $q->where('branch', $branch)
                        ->orWhere('branch', 'like', "%{$branch}%")
                        ->orWhereHas('participants', function ($pq) use ($branch) {
                            $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                        });
                });
            }
            $teacherCount = $teacherQuery->count();
        }

        // 2. Students (binaan) count for branch from Penyaluran API (fallback to local DB)
        $studentCount = 0;
        try {
            $queryParams = [];
            if ($userKantorId) {
                $queryParams['kantor_id'] = $userKantorId;
            }
            $apiStudents = $penyaluran->allStudents($queryParams);
            if (empty($apiStudents) && ! empty($queryParams)) {
                $apiStudents = $penyaluran->allStudents();
            }

            if (! empty($apiStudents)) {
                $studentsCol = collect($apiStudents);
                if (filled($branch)) {
                    $branchLower = strtolower($branch);
                    $studentsCol = $studentsCol->filter(function (array $s) use ($branchLower, $userKantorId) {
                        if ($userKantorId && ! empty($s['kantor_id']) && (int) $s['kantor_id'] === (int) $userKantorId) {
                            return true;
                        }

                        $kantor = strtolower(trim((string) ($s['kantor_name'] ?? $s['branch'] ?? '')));
                        if ($kantor !== '') {
                            $cleanKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $kantor));
                            $cleanKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanKantor));
                            if (str_contains($kantor, $branchLower) || str_contains($branchLower, $cleanKantor)) {
                                return true;
                            }
                        }

                        $sanggarKantor = strtolower(trim((string) ($s['sanggar']['kantor_name'] ?? $s['sanggar']['kantor'] ?? $s['sanggar']['cabang'] ?? '')));
                        if ($sanggarKantor !== '') {
                            $cleanSKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $sanggarKantor));
                            $cleanSKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanSKantor));
                            if (str_contains($sanggarKantor, $branchLower) || str_contains($branchLower, $cleanSKantor)) {
                                return true;
                            }
                        }

                        return false;
                    });
                }
                $studentCount = $studentsCol->unique('id')->count();
            }
        } catch (\Throwable $e) {
            $studentCount = 0;
        }

        if ($studentCount === 0) {
            $studentQuery = Student::query();
            if (filled($branch)) {
                $studentQuery->where(function ($q) use ($branch) {
                    $q->whereHas('participants', function ($pq) use ($branch) {
                        $pq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                    })->orWhereHas('mentor', function ($mq) use ($branch) {
                        $mq->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                    });
                });
            }
            $studentCount = $studentQuery->count();
        }

        // 3. Sanggars count for branch from Penyaluran API (matching SanggarController)
        $sanggarCount = 0;
        try {
            $apiSanggars = $penyaluran->allSanggars();
            $mergedSanggars = collect($apiSanggars);

            if (filled($branch)) {
                $branchLower = strtolower($branch);
                $mergedSanggars = $mergedSanggars->filter(function ($item) use ($branchLower) {
                    $kantor = strtolower(trim((string) ($item['kantor_name'] ?? $item['branch'] ?? '')));
                    if ($kantor !== '') {
                        $cleanKantor = trim(preg_replace('/^(kantor\s+)?(layanan\s+)?(cabang\s+)?/i', '', $kantor));
                        $cleanKantor = trim(preg_replace('/\s*(cabang|kantor)\s*$/i', '', $cleanKantor));
                        if (str_contains($kantor, $branchLower) || str_contains($branchLower, $cleanKantor)) {
                            return true;
                        }
                    }

                    return false;
                });
            }
            $sanggarCount = $mergedSanggars->count();
        } catch (\Throwable $e) {
            $sanggarCount = 0;
        }

        if ($sanggarCount === 0) {
            $sanggarCount = Participant::query()
                ->whereNotNull('penyaluran_sanggar_name')
                ->where('penyaluran_sanggar_name', '<>', '')
                ->when(filled($branch), fn ($q) => $q->where(function ($sub) use ($branch) {
                    $sub->where('branch', $branch)->orWhere('branch', 'like', "%{$branch}%");
                }))
                ->distinct('penyaluran_sanggar_name')
                ->count('penyaluran_sanggar_name');
        }

        $title = $branch ? "Dashboard Cabang {$branch}" : 'Dashboard Cabang';

        return [
            'view' => 'admin/dashboard/admin',
            'data' => [
                'pageTitle' => $title,
                'branchName' => $branch,
                'isCabang' => true,
                'participantCount' => $participantCount,
                'verifiedParticipantCount' => $verifiedParticipantCount,
                'submittedParticipantCount' => $submittedParticipantCount,
                'teacherCount' => $teacherCount,
                'studentCount' => $studentCount,
                'sanggarCount' => $sanggarCount,
            ],
        ];
    }

    private static function admin(): array
    {
        $penyaluran = app(PenyaluranService::class);

        $teacherCount = 0;
        try {
            $apiTeachers = $penyaluran->allTeachers();
            $teacherCount = ! empty($apiTeachers) ? collect($apiTeachers)->unique('id')->count() : 0;
        } catch (\Throwable $e) {
            $teacherCount = 0;
        }
        if ($teacherCount === 0) {
            $teacherCount = User::role('Teacher')->count();
        }

        $studentCount = 0;
        try {
            $apiStudents = $penyaluran->allStudents();
            $studentCount = ! empty($apiStudents) ? collect($apiStudents)->unique('id')->count() : 0;
        } catch (\Throwable $e) {
            $studentCount = 0;
        }
        if ($studentCount === 0) {
            $studentCount = Student::where('is_binaan', true)->count();
        }

        return [
            'view' => 'admin/dashboard/admin',
            'data' => [
                'pageTitle' => 'Dashboard Admin',
                'participantCount' => Participant::count(),
                'verifiedParticipantCount' => Participant::where('status', 'verified')->count(),
                'submittedParticipantCount' => Participant::where('status', 'submitted')->count(),
                'teacherCount' => $teacherCount,
                'studentCount' => $studentCount,
                'olimpiadeCount' => Olimpiade::count(),
            ],
        ];
    }

    private static function teacher(User $user): array
    {
        $penyaluran = app(PenyaluranService::class);
        $token = session('penyaluran_token') ?? $user->penyaluran_token;

        $penyaluranProfile = null;
        $sanggars = [];
        $penyaluranStudents = [];

        // 1. Ambil Profile Penyaluran dari Session terlebih dahulu
        if (session()->has('penyaluran_me')) {
            $sessionMe = session()->get('penyaluran_me');
            if (is_array($sessionMe) && ! empty($sessionMe)) {
                $penyaluranProfile = $sessionMe;
            }
        }

        if (! $penyaluranProfile && $token) {
            try {
                $penyaluranProfile = $penyaluran->me($token);
            } catch (\Throwable $e) {
                $penyaluranProfile = null;
            }
        }

        // 2. Ambil Students Penyaluran dari Session terlebih dahulu (atau via PenyaluranService)
        if (session()->has('penyaluran_students')) {
            $rawSessionStudents = session()->get('penyaluran_students');
            if (is_array($rawSessionStudents) && ! empty($rawSessionStudents)) {
                $penyaluranStudents = $penyaluran->students($token ?: 'session');
            }
        }

        if (empty($penyaluranStudents) && $token) {
            try {
                $penyaluranStudents = $penyaluran->students($token);
            } catch (\Throwable $e) {
                $penyaluranStudents = [];
            }
        }

        if (empty($penyaluranStudents) && isset($penyaluranProfile['students']) && is_array($penyaluranProfile['students']) && ! empty($penyaluranProfile['students'])) {
            $penyaluranStudents = $penyaluran->students($token ?: 'session');
        }

        // 3. Ambil Sanggars Penyaluran dari Session terlebih dahulu (atau via PenyaluranService)
        if (session()->has('penyaluran_sanggars')) {
            $rawSessionSanggars = session()->get('penyaluran_sanggars');
            if (is_array($rawSessionSanggars) && ! empty($rawSessionSanggars)) {
                $sanggars = $penyaluran->enrichSanggarsWithStudentCounts($rawSessionSanggars, $token);
            }
        }

        if (empty($sanggars) && $token) {
            try {
                $sanggars = $penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }

        if (empty($sanggars) && isset($penyaluranProfile['sanggars']) && is_array($penyaluranProfile['sanggars']) && ! empty($penyaluranProfile['sanggars'])) {
            $sanggars = $penyaluran->enrichSanggarsWithStudentCounts($penyaluranProfile['sanggars'], $token);
        }

        $penyaluranTotal = ! empty($penyaluranStudents)
            ? count($penyaluranStudents)
            : (isset($penyaluranProfile['total_students']) && is_numeric($penyaluranProfile['total_students']) ? (int) $penyaluranProfile['total_students'] : null);

        $sanggarCount = count($sanggars);
        $sanggarSum = collect($sanggars)->sum(fn ($s) => (int) ($s['total_students'] ?? 0));
        if ($sanggarSum === 0 && $penyaluranTotal > 0 && $sanggarCount > 0) {
            $sanggarSum = $penyaluranTotal;
        }
        $overlap = ($sanggarSum && $penyaluranTotal && $sanggarSum > $penyaluranTotal) ? $sanggarSum - $penyaluranTotal : 0;

        $localStudentCount = Student::where('mentor_id', $user->id)->where('is_binaan', true)->count();
        $studentCount = ($penyaluranTotal !== null && $penyaluranTotal > 0) ? $penyaluranTotal : $localStudentCount;

        $isValidNik = function (?string $nik): bool {
            if (! $nik) {
                return false;
            }
            $trimmed = trim($nik);

            return $trimmed !== '' && $trimmed !== '-' && $trimmed !== '0' && strlen($trimmed) >= 10;
        };

        $registeredCount = Participant::query()
            ->where(function ($q) use ($user, $penyaluranStudents, $isValidNik) {
                $q->where('mentor_id', $user->id)
                    ->orWhereHas('student', fn ($sq) => $sq->where('mentor_id', $user->id));

                $sessionIds = collect($penyaluranStudents)->pluck('student_id')->filter()->map(fn ($id) => (int) $id)->all();
                $sessionNiks = collect($penyaluranStudents)->pluck('nik')->filter(fn ($n) => $isValidNik($n))->unique()->values()->all();

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
