<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'olimpiade_id' => ['required', 'integer', 'exists:olimpiades,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:120'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'birth_place' => ['required', 'string', 'max:120'],
            'birth_date' => ['required', 'date', 'before:today'],
            'age' => ['required', 'integer', 'min:5', 'max:20'],
            'education_level' => ['required', Rule::in(['SD/MI', 'SMP/MTs'])],
            'school_name' => ['required', 'string', 'max:255'],
            'grade' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string'],
            'province_id' => ['required', 'exists:provinces,id'],
            'regency_id' => ['required', 'exists:regencies,id'],
            'parent_phone' => ['required', 'string', 'max:30'],
            'development_program' => ['required', Rule::in(['sanggar_genius', 'sanggar_alquran', 'asrama_yatim_mandiri', 'other'])],
            'development_program_other' => ['nullable', 'required_if:development_program,other', 'string', 'max:255'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'branch_office' => ['nullable', 'string', 'max:255'],
            'mentor_name' => ['nullable', 'string', 'max:255'],
            'mentor_phone' => ['nullable', 'string', 'max:30'],
            'achievements' => ['nullable', 'string'],
            'has_joined_before' => ['sometimes', 'boolean'],
            'previous_year' => ['nullable', Rule::requiredIf(fn () => $this->boolean('has_joined_before')), 'integer', 'min:2016', 'max:'.date('Y')],
            'photo' => ['nullable', 'file', 'image', 'max:2048'],
            'identity_card' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'recommendation_letter' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'achievement_certificate' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'data_truth_consent' => ['sometimes', 'boolean'],
            'documentation_consent' => ['sometimes', 'boolean'],
            'rules_consent' => ['sometimes', 'boolean'],
            'participant_signature_name' => ['required', 'string', 'max:255'],
            'guardian_signature_name' => ['required', 'string', 'max:255'],
            'status' => ['required', Rule::in(['submitted', 'verified', 'rejected'])],
            'notes' => ['nullable', 'string'],
        ];
    }
}
