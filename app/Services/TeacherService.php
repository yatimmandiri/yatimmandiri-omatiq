<?php

namespace App\Services;

use App\Concerns\Traits\UploadFiles;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class TeacherService
{
    use UploadFiles;

    private const STUDENT_FIELDS = [
        'nik', 'full_name', 'nickname', 'gender', 'birth_place', 'birth_date',
        'age', 'school_name', 'grade', 'address', 'province_id', 'regency_id',
        'parent_phone', 'mentor_name', 'mentor_phone',
    ];

    private function studentFileMap(): array
    {
        return [
            'photo' => 'photo_path',
            'identity_card' => 'identity_card_path',
            'family_card' => 'family_card_path',
        ];
    }

    private function handleStudentFiles(?Student $student, array &$data): void
    {
        foreach ($this->studentFileMap() as $input => $column) {
            if (! isset($data[$input]) || ! ($data[$input] instanceof UploadedFile)) {
                unset($data[$input]);

                continue;
            }
            $oldPath = $student?->{$column};
            $data[$column] = $this->uploadFile($oldPath, $data[$input], 'uploads/students/'.$input);
            unset($data[$input]);
        }
    }

    private function extractStudentData(array &$data): array
    {
        $studentData = [];
        foreach (self::STUDENT_FIELDS as $field) {
            if (array_key_exists($field, $data)) {
                $studentData[$field] = $data[$field];
                unset($data[$field]);
            }
        }

        return $studentData;
    }

    public function getStudents(User $teacher): LengthAwarePaginator
    {
        return Participant::query()
            ->with(['olimpiade:id,name', 'student:id,full_name,school_name,nik,province_id,regency_id'])
            ->where('mentor_id', $teacher->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    }

    public function getStudentById(User $teacher, int $id): Participant
    {
        return Participant::query()
            ->with(['olimpiade:id,name,category,slug', 'student.province:id,name', 'student.regency:id,name'])
            ->where('mentor_id', $teacher->id)
            ->findOrFail($id);
    }

    public function registerStudent(User $teacher, array $data): Participant
    {
        return DB::transaction(function () use ($teacher, &$data) {
            $studentData = $this->extractStudentData($data);
            $nik = $studentData['nik'] ?? null;

            $student = $nik ? Student::where('nik', $nik)->first() : null;

            $studentData['mentor_id'] = $teacher->id;
            $studentData['is_binaan'] = true;

            if ($student) {
                $this->handleStudentFiles($student, $studentData);
                $student->update($studentData);
            } else {
                $this->handleStudentFiles(null, $studentData);
                $student = Student::create($studentData);
            }

            $data['student_id'] = $student->id;
            $data['mentor_id'] = $teacher->id;
            $data['registration_type'] = 'teacher';
            $data['registration_number'] = $this->generateRegistrationNumber();
            $data['status'] = 'submitted';
            $data['data_truth_consent'] = true;
            $data['documentation_consent'] = true;
            $data['rules_consent'] = true;

            return Participant::create($data);
        });
    }

    public function updateStudent(User $teacher, Participant $participant, array $data): Participant
    {
        return DB::transaction(function () use ($participant, &$data) {
            $studentData = $this->extractStudentData($data);
            $student = $participant->student;

            if ($student && ! empty($studentData)) {
                $this->handleStudentFiles($student, $studentData);
                $student->update($studentData);
            }

            $participant->update($data);

            return $participant->fresh()->load('student');
        });
    }

    public function checkNik(string $nik): ?Student
    {
        return Student::query()->where('nik', $nik)->first();
    }

    public function getFormOptions(): array
    {
        return [
            'olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'category', 'slug']),
            'provinces' => Province::query()->orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::query()
                ->orderBy('name')
                ->get(['id', 'province_id', 'name'])
                ->map(fn (Regency $regency) => [
                    'id' => $regency->id,
                    'province_id' => $regency->province_id,
                    'name' => $regency->name,
                ]),
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
