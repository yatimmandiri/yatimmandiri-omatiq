<?php

namespace App\Services;

use App\Concerns\Traits\UploadFiles;
use App\Http\Requests\Company\StoreStudentRequest;
use App\Http\Requests\Company\UpdateStudentRequest;
use App\Models\Company\Student;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\User;

class StudentService
{
    use UploadFiles;

    public function __construct(
        private readonly PenyaluranService $penyaluran,
    ) {}

    private const STUDENT_FIELDS = [
        'nik', 'full_name', 'nickname', 'gender', 'birth_place', 'birth_date',
        'school_level', 'nis', 'school_name', 'grade', 'address', 'province_id', 'regency_id',
        'parent_phone', 'mentor_id', 'mentor_name', 'mentor_phone', 'is_binaan',
    ];

    /**
     * Sync student changes to Penyaluran if student is registered in Penyaluran.
     *
     * @throws \RuntimeException
     */
    public function syncToPenyaluran(Student $student, array $data, ?string $token = null): void
    {
        if (! $student->penyaluran_id) {
            return;
        }

        $token ??= request()?->session()?->get('penyaluran_token')
            ?? auth()->user()?->penyaluran_token
            ?? $student->mentor?->penyaluran_token;

        if (! $token) {
            if (app()->environment('testing')) {
                return;
            }
            throw new \RuntimeException('Sesi Penyaluran tidak ditemukan untuk sinkronisasi data santri.');
        }

        $payload = $this->penyaluran->formatStudentPayload($data);
        if (empty($payload)) {
            return;
        }

        $this->penyaluran->updateStudent($token, $student->penyaluran_id, $payload);
    }

    public function payloadFromRequest(StoreStudentRequest|UpdateStudentRequest $request, ?Student $student = null): array
    {
        $data = $request->validated();

        foreach ($this->fileMap() as $input => $column) {
            if ($request->hasFile($input)) {
                $data[$column] = $this->uploadFile($student?->{$column}, $request->file($input), 'uploads/students/'.$input);
            }

            unset($data[$input]);
        }

        $data['is_binaan'] = $request->boolean('is_binaan');
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        return $data;
    }

    public function showPayload(Student $student): array
    {
        $payload = $student->toArray();

        $payload['photo_url'] = $student->photo_url;
        $payload['identity_card_url'] = $student->identity_card_url;
        $payload['family_card_url'] = $student->family_card_url;

        return $payload;
    }

    public function formOptions(): array
    {
        return [
            'provinces' => Province::query()->orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::query()
                ->orderBy('name')
                ->get(['id', 'province_id', 'name'])
                ->map(fn (Regency $regency) => [
                    'id' => $regency->id,
                    'province_id' => $regency->province_id,
                    'name' => $regency->name,
                ]),
            'mentors' => User::query()
                ->with('roles')
                ->whereHas('roles', fn ($query) => $query->where('name', 'Teacher'))
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ];
    }

    private function fileMap(): array
    {
        return [
            'photo' => 'photo_path',
            'identity_card' => 'identity_card_path',
            'family_card' => 'family_card_path',
        ];
    }
}
