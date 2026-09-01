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
        return Participant::query()
            ->with(['olimpiade:id,name,category,slug', 'student', 'student.province:id,name', 'student.regency:id,name', 'student.village:id,name'])
            ->where('mentor_id', $teacher->id)
            ->findOrFail($id);
    }

    /**
     * Register a binaan from penyaluran API into Olimpiade. Creates Student master + Participant form.
     *
     * @param  array{penyaluran_student_id:int, olimpiade_id:int, penyaluran_sanggar_id?:int, penyaluran_sanggar_name?:string, birth_date?:string, address?:string, province_id?:string, regency_id?:string, district_id?:string, village_id?:string, nickname?:string, birth_place?:string, parent_phone?:string, mentor_phone?:string, achievements?:string, has_joined_before?:bool, previous_year?:int, referral_source?:string, branch?:string, notes?:string}  $data
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

        $olimpiade = Olimpiade::find($data['olimpiade_id']);
        $eventYear = $olimpiade?->event_year ?? (int) date('Y');

        return DB::transaction(function () use ($teacher, $data, $penyaluranStudent, $mapGender, $eventYear) {
            $penyaluranId = $penyaluranStudent['student_id'] ?? $penyaluranStudent['id'] ?? $data['penyaluran_student_id'];
            $student = Student::query()
                ->where('penyaluran_id', $penyaluranId)
                ->when($penyaluranStudent['nik'] ?? null, fn ($query, $nik) => $query->orWhere('nik', $nik))
                ->first();

            // Create/update Student master (is_binaan true, no User) with full data
            $student ??= new Student;
            $student->fill([
                'penyaluran_id' => $penyaluranId,
                'nik' => $penyaluranStudent['nik'] ?? $student->nik,
                'full_name' => $penyaluranStudent['name'] ?? $penyaluranStudent['full_name'] ?? $student->full_name ?? '',
                'nickname' => $data['nickname'] ?? $penyaluranStudent['nickname'] ?? $student->nickname,
                'gender' => $mapGender($penyaluranStudent['gender'] ?? null) ?? $student->gender,
                'birth_place' => $data['birth_place'] ?? $penyaluranStudent['birth_place'] ?? $student->birth_place,
                'birth_date' => $data['birth_date'] ?? $penyaluranStudent['birth_date'] ?? $student->birth_date,
                'nis' => $penyaluranStudent['nis'] ?? $student->nis,
                'school_level' => $penyaluranStudent['school_level'] ?? $student->school_level,
                'school_name' => $penyaluranStudent['school_name'] ?? $student->school_name,
                'grade' => $penyaluranStudent['class'] ?? $penyaluranStudent['grade'] ?? $student->grade,
                'address' => $data['address'] ?? $penyaluranStudent['address'] ?? $student->address,
                'province_id' => $data['province_id'] ?? $student->province_id,
                'regency_id' => $data['regency_id'] ?? $student->regency_id,
                'district_id' => $data['district_id'] ?? $student->district_id,
                'village_id' => $data['village_id'] ?? $student->village_id,
                'parent_phone' => $data['parent_phone'] ?? $penyaluranStudent['guardian_phone'] ?? $student->parent_phone,
                'mentor_name' => $teacher->name,
                'mentor_phone' => $data['mentor_phone'] ?? $teacher->phone ?? $student->mentor_phone,
                'mentor_id' => $teacher->id,
                'is_binaan' => true,
            ])->save();

            return Participant::create([
                'student_id' => $student->id,
                'penyaluran_sanggar_id' => $data['penyaluran_sanggar_id'] ?? $penyaluranStudent['sanggar_id'] ?? null,
                'penyaluran_sanggar_name' => $data['penyaluran_sanggar_name'] ?? $penyaluranStudent['sanggar_name'] ?? null,
                'mentor_id' => $teacher->id,
                'olimpiade_id' => $data['olimpiade_id'],
                'event_year' => $eventYear,
                'registration_type' => 'teacher',
                'registration_number' => $this->generateRegistrationNumber(),
                'status' => 'verified',
                'achievements' => $data['achievements'] ?? null,
                'has_joined_before' => $data['has_joined_before'] ?? false,
                'previous_year' => $data['previous_year'] ?? null,
                'referral_source' => $data['referral_source'] ?? null,
                'branch' => $data['branch'] ?? $penyaluranStudent['kantor_name'] ?? null,
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
    public function getFormOptionsFromApi(array $penyaluranStudents, ?int $studentId = null, ?int $eventYear = null): array
    {
        $eventYear ??= (int) date('Y');
        // Exclude students already actively registered for this event_year
        // Active binaan are those with a Student linked via penyaluran_id or student_id
        $activePenyaluranIds = Participant::query()
            ->where(function ($q) use ($eventYear) {
                $q->where('event_year', $eventYear);
                if ($eventYear == 2026) {
                    $q->orWhereNull('event_year');
                }
            })
            ->whereIn('status', ['submitted', 'verified'])
            ->whereHas('student', fn ($q) => $q->whereNotNull('penyaluran_id'))
            ->with('student:id,penyaluran_id')
            ->get()
            ->pluck('student.penyaluran_id')
            ->filter()
            ->unique()
            ->all();

        $activeStudentIds = Participant::query()
            ->where(function ($q) use ($eventYear) {
                $q->where('event_year', $eventYear);
                if ($eventYear == 2026) {
                    $q->orWhereNull('event_year');
                }
            })
            ->whereIn('status', ['submitted', 'verified'])
            ->pluck('student_id')
            ->filter()
            ->all();

        $activeIds = array_unique(array_merge($activePenyaluranIds, $activeStudentIds));

        $filtered = collect($penyaluranStudents)
            ->filter(fn (array $s) => ! in_array((int) ($s['student_id'] ?? $s['id'] ?? 0), $activeIds, true))
            ->map(fn (array $s) => [
                'id' => $s['student_id'] ?? $s['id'],
                'nik' => $s['nik'] ?? null,
                'full_name' => $s['name'] ?? $s['full_name'] ?? '-',
                'school_name' => $s['school_name'] ?? null,
                'school_level' => $s['school_level'] ?? null,
                'grade' => $s['class'] ?? $s['grade'] ?? null,
                'birth_date' => $s['birth_date'] ?? null,
                'address' => $s['address'] ?? null,
                'guardian_name' => $s['guardian_name'] ?? null,
                'guardian_phone' => $s['guardian_phone'] ?? null,
                'sanggar_id' => $s['sanggar_id'] ?? null,
                'sanggar_name' => $s['sanggar_name'] ?? null,
                'kantor_name' => $s['kantor_name'] ?? null,
            ])
            ->sortBy('full_name')
            ->values();

        $preselected = $filtered->contains(fn (array $s) => (int) $s['id'] === (int) $studentId) ? $studentId : null;

        return [
            'olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'category', 'slug', 'event_year']),
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
