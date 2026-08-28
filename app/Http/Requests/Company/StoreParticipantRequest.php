<?php

namespace App\Http\Requests\Company;

use App\Models\Company\Olimpiade;
use App\Models\Company\Student;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nik' => [
                'required',
                'string',
                'size:16',
                function (string $attribute, mixed $value, Closure $fail) {
                    $eventYear = null;
                    if ($this->filled('olimpiade_id')) {
                        $eventYear = Olimpiade::find($this->input('olimpiade_id'))?->event_year ?? 2026;
                    }
                    if (Student::hasActiveRegistrationFor($value, $eventYear)) {
                        $fail('NIK ini sudah memiliki pendaftaran aktif pada OMATIQ '.($eventYear ?? '').'.');
                    }
                },
            ],
            'olimpiade_id' => ['required', 'integer', 'exists:olimpiades,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:120'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'birth_place' => ['required', 'string', 'max:120'],
            'birth_date' => ['required', 'date', 'before:today'],
            'age' => ['required', 'integer', 'min:5', 'max:20'],
            'school_name' => ['required', 'string', 'max:255'],
            'grade' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string'],
            'province_id' => ['required', 'exists:provinces,id'],
            'regency_id' => ['required', 'exists:regencies,id'],
            'parent_phone' => ['required', 'string', 'max:30'],
            'mentor_name' => ['nullable', 'string', 'max:255'],
            'mentor_phone' => ['nullable', 'string', 'max:30'],
            'referral_source' => ['required', 'string', 'max:255'],
            'branch' => ['required', 'string', 'max:255'],
            'payment_proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'student_card' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'data_truth_consent' => ['accepted'],
            'documentation_consent' => ['accepted'],
            'rules_consent' => ['accepted'],
            'participant_signature_name' => ['required', 'string', 'max:255'],
            'guardian_signature_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
