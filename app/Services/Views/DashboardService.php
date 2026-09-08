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

    /**
     * Normalize biodata guru dari Penyaluran API (sumber tunggal).
     * Fallback ke User lokal untuk email/phone jika API tidak mengembalikan.
     *
     * @return array{name:?string,email:?string,phone:?string,nik:?string,gender:?string,birth_place:?string,birth_date:?string,address:?string,photo_url:?string}
     */
    private static function guruBiodataFromPenyaluran(?array $profile, User $user): array
    {
        if (! $profile) {
            return [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'nik' => null,
                'gender' => null,
                'birth_place' => null,
                'birth_date' => null,
                'address' => null,
                'photo_url' => null,
            ];
        }

        $gender = $profile['gender'] ?? $profile['jenis_kelamin'] ?? null;
        if ($gender === 'L') {
            $gender = 'male';
        } elseif ($gender === 'P') {
            $gender = 'female';
        }

        return [
            'name' => $profile['name'] ?? $profile['nama'] ?? $user->name,
            'email' => $profile['email'] ?? $user->email,
            'phone' => $profile['phone'] ?? $profile['hp'] ?? $profile['no_hp'] ?? $user->phone,
            'nik' => $profile['nik'] ?? null,
            'gender' => $gender,
            'birth_place' => $profile['birth_place'] ?? $profile['tempat_lahir'] ?? null,
            'birth_date' => $profile['birth_date'] ?? $profile['tanggal_lahir'] ?? $profile['tgl_lahir'] ?? null,
            'address' => $profile['address'] ?? $profile['alamat'] ?? null,
            'photo_url' => $profile['photo_url'] ?? $profile['foto'] ?? null,
            'province_id' => $profile['province_id'] ?? $profile['provinsi_id'] ?? null,
            'regency_id' => $profile['regency_id'] ?? $profile['kabupaten_id'] ?? $profile['kota_id'] ?? null,
            'district_id' => $profile['district_id'] ?? $profile['kecamatan_id'] ?? null,
            'village_id' => $profile['village_id'] ?? $profile['desa_id'] ?? $profile['kelurahan_id'] ?? null,
        ];
    }

    private static function guruCompleteness(array $biodata): array
    {
        $fields = [
            'name' => filled($biodata['name'] ?? null),
            'email' => filled($biodata['email'] ?? null) && ! str_ends_with((string) ($biodata['email'] ?? ''), '@penyaluran.local'),
            'phone' => filled($biodata['phone'] ?? null),
            'nik' => filled($biodata['nik'] ?? null),
            'gender' => filled($biodata['gender'] ?? null),
            'birth_place' => filled($biodata['birth_place'] ?? null),
            'birth_date' => filled($biodata['birth_date'] ?? null),
            'address' => filled($biodata['address'] ?? null),
            'province_id' => filled($biodata['province_id'] ?? null),
            'regency_id' => filled($biodata['regency_id'] ?? null),
            'district_id' => filled($biodata['district_id'] ?? null),
            'village_id' => filled($biodata['village_id'] ?? null),
        ];

        $filled = collect($fields)->filter()->count();
        $total = count($fields);
        $percent = $total > 0 ? (int) round(($filled / $total) * 100) : 0;

        return [
            'fields' => $fields,
            'filled' => $filled,
            'total' => $total,
            'percent' => $percent,
            'is_complete' => $percent === 100,
            'missing' => collect($fields)->filter(fn ($v) => ! $v)->keys()->all(),
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
