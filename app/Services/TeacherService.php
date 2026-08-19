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
            ->with(['olimpiade:id,name,category,slug', 'student.province:id,name', 'student.regency:id,name'])
            ->where('mentor_id', $teacher->id)
            ->findOrFail($id);
    }

    public function registerStudent(User $teacher, array $data): Participant
    {
        $student = Student::query()
            ->where('mentor_id', $teacher->id)
            ->where('is_binaan', true)
            ->findOrFail($data['student_id']);

        return DB::transaction(function () use ($teacher, $student, $data) {
            return Participant::create([
                'student_id' => $student->id,
                'mentor_id' => $teacher->id,
                'olimpiade_id' => $data['olimpiade_id'],
                'registration_type' => 'teacher',
                'registration_number' => $this->generateRegistrationNumber(),
                'status' => 'submitted',
                'data_truth_consent' => true,
                'documentation_consent' => true,
                'rules_consent' => true,
            ])->load('student:id,full_name');
        });
    }

    public function getFormOptions(User $teacher, ?int $studentId = null): array
    {
        $activeStudentIds = Participant::query()
            ->whereIn('status', Student::ACTIVE_STATUSES)
            ->whereNotNull('student_id')
            ->pluck('student_id');

        $students = Student::query()
            ->where('mentor_id', $teacher->id)
            ->where('is_binaan', true)
            ->whereNotIn('id', $activeStudentIds)
            ->orderBy('full_name')
            ->get(['id', 'nik', 'full_name', 'school_name', 'grade'])
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'nik' => $student->nik,
                'full_name' => $student->full_name,
                'school_name' => $student->school_name,
                'grade' => $student->grade,
            ]);

        $preselected = $students->contains(fn (array $student) => $student['id'] === $studentId) ? $studentId : null;

        return [
            'olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'category', 'slug']),
            'students' => $students->values(),
            'preselected_student_id' => $preselected,
        ];
    }

    private function generateRegistrationNumber(): string
    {
        $prefix = 'OMQ-'.now()->format('Ymd');

        return DB::transaction(function () use ($prefix) {
            $latest = Participant::query()
                ->where('registration_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->count();

            return $prefix.'-'.str_pad((string) ($latest + 1), 4, '0', STR_PAD_LEFT);
        });
    }
}
