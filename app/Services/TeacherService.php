<?php

namespace App\Services;

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Illuminate\Support\Facades\DB;

class TeacherService
{
    public function getStudentById(User $teacher, int $id): Participant
    {
        $participant = Participant::query()
            ->with(['olimpiade:id,name,category,slug'])
            ->where('mentor_id', $teacher->id)
            ->findOrFail($id);

        // Synthesize student relation from penyaluran snapshot for pure-API binaan (like ParticipantController::participantPayload)
        if (! $participant->relationLoaded('student') || ! $participant->student) {
            if ($participant->penyaluran_student_id) {
                $synthetic = new Student([
                    'full_name' => $participant->penyaluran_student_name,
                    'nik' => $participant->penyaluran_student_nik ?? $participant->nik,
                    'gender' => $participant->penyaluran_student_gender,
                    'school_name' => $participant->penyaluran_student_school_name,
                    'grade' => $participant->penyaluran_student_class,
                    'birth_date' => $participant->penyaluran_student_birth_date,
                ]);
                $synthetic->setAttribute('nis', $participant->penyaluran_student_nis);
                $synthetic->setAttribute('school_level', $participant->penyaluran_student_school_level);
                $participant->setRelation('student', $synthetic);
            }
        }

        return $participant;
    }

    /**
     * Register a binaan from penyaluran API into Olimpiade.
     *
     * @param  array{penyaluran_student_id:int, olimpiade_id:int, penyaluran_sanggar_id?:int, penyaluran_sanggar_name?:string, achievements?:string, has_joined_before?:bool, previous_year?:int, referral_source?:string, branch?:string, notes?:string}  $data
     */
    public function registerStudent(User $teacher, array $data, array $penyaluranStudent): Participant
    {
        $mapGender = function (?string $g) {
            if ($g === 'L') {
                return 'male';
            }
            if ($g === 'P') {
                return 'female';
            }

            return $g;
        };

        return DB::transaction(function () use ($teacher, $data, $penyaluranStudent, $mapGender) {
            return Participant::create([
                'penyaluran_student_id' => $penyaluranStudent['student_id'] ?? $penyaluranStudent['id'] ?? $data['penyaluran_student_id'],
                'penyaluran_student_name' => $penyaluranStudent['name'] ?? $penyaluranStudent['full_name'] ?? '',
                'penyaluran_student_nik' => $penyaluranStudent['nik'] ?? null,
                'penyaluran_student_nis' => $penyaluranStudent['nis'] ?? null,
                'penyaluran_student_gender' => $mapGender($penyaluranStudent['gender'] ?? null),
                'penyaluran_student_school_name' => $penyaluranStudent['school_name'] ?? null,
                'penyaluran_student_school_level' => $penyaluranStudent['school_level'] ?? null,
                'penyaluran_student_class' => $penyaluranStudent['class'] ?? $penyaluranStudent['grade'] ?? null,
                'penyaluran_student_birth_date' => $penyaluranStudent['birth_date'] ?? null,
                'nik' => $penyaluranStudent['nik'] ?? null,
                'penyaluran_sanggar_id' => $data['penyaluran_sanggar_id'] ?? null,
                'penyaluran_sanggar_name' => $data['penyaluran_sanggar_name'] ?? null,
                'mentor_id' => $teacher->id,
                'olimpiade_id' => $data['olimpiade_id'],
                'registration_type' => 'teacher',
                'registration_number' => $this->generateRegistrationNumber(),
                'status' => 'submitted',
                'achievements' => $data['achievements'] ?? null,
                'has_joined_before' => $data['has_joined_before'] ?? false,
                'previous_year' => $data['previous_year'] ?? null,
                'referral_source' => $data['referral_source'] ?? null,
                'branch' => $data['branch'] ?? null,
                'notes' => $data['notes'] ?? null,
                'data_truth_consent' => true,
                'documentation_consent' => true,
                'rules_consent' => true,
            ]);
        });
    }

    /**
     * Build form options from penyaluran API.
     *
     * @param  array<int, array>  $penyaluranStudents  raw from PenyaluranService::students()
     */
    public function getFormOptionsFromApi(array $penyaluranStudents, ?int $studentId = null): array
    {
        $activeIds = Participant::query()
            ->whereIn('status', ['submitted', 'verified'])
            ->where(function ($q) {
                $q->whereNotNull('penyaluran_student_id')->orWhereNotNull('student_id');
            })
            ->get(['penyaluran_student_id', 'student_id'])
            ->flatMap(fn ($p) => [(int) $p->penyaluran_student_id, (int) $p->student_id])
            ->filter()
            ->unique()
            ->all();

        $filtered = collect($penyaluranStudents)
            ->filter(fn (array $s) => ! in_array((int) ($s['student_id'] ?? $s['id'] ?? 0), $activeIds, true))
            ->map(fn (array $s) => [
                'id' => $s['student_id'] ?? $s['id'],
                'nik' => $s['nik'] ?? null,
                'full_name' => $s['name'] ?? $s['full_name'] ?? '-',
                'school_name' => $s['school_name'] ?? null,
                'grade' => $s['class'] ?? $s['grade'] ?? null,
            ])
            ->sortBy('full_name')
            ->values();

        $preselected = $filtered->contains(fn (array $s) => (int) $s['id'] === (int) $studentId) ? $studentId : null;

        return [
            'olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'category', 'slug']),
            'students' => $filtered,
            'preselected_student_id' => $preselected,
        ];
    }

    private function generateRegistrationNumber(): string
    {
        $prefix = 'OMQ-'.now()->format('Ymd');

        return DB::transaction(function () use ($prefix) {
            $max = Participant::query()
                ->where('registration_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->max('registration_number');

            $next = 1;
            if ($max && preg_match('/-(\d{4})$/', $max, $m)) {
                $next = ((int) $m[1]) + 1;
            }

            return $prefix.'-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
        });
    }
}
