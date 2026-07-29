<?php

namespace App\Services;

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Core\Province;
use App\Models\Core\Regency;
use App\Models\Core\User;
use Illuminate\Support\Facades\DB;

class TeacherService
{
    public function getStudents(User $teacher): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Participant::query()
            ->with(['olimpiade:id,name', 'province:id,name', 'regency:id,name'])
            ->where('mentor_id', $teacher->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    }

    public function getStudentById(User $teacher, int $id): Participant
    {
        return Participant::query()
            ->with(['olimpiade:id,name,category,slug', 'province:id,name', 'regency:id,name'])
            ->where('mentor_id', $teacher->id)
            ->findOrFail($id);
    }

    public function registerStudent(User $teacher, array $data): Participant
    {
        return DB::transaction(function () use ($teacher, $data) {
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
        return DB::transaction(function () use ($teacher, $participant, $data) {
            $participant->update($data);

            return $participant->fresh();
        });
    }

    public function checkNik(string $nik): ?Participant
    {
        return Participant::query()->where('nik', $nik)->first();
    }

    public function getFormOptions(): array
    {
        return [
            'olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'category', 'slug']),
            'provinces' => Province::query()->orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::query()->orderBy('name')->get(['id', 'province_id', 'name']),
        ];
    }

    private function generateRegistrationNumber(): string
    {
        $prefix = 'OMQ-' . now()->format('Ymd');

        return DB::transaction(function () use ($prefix) {
            $latest = Participant::query()
                ->where('registration_number', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->count();

            return $prefix . '-' . str_pad((string) ($latest + 1), 4, '0', STR_PAD_LEFT);
        });
    }
}
