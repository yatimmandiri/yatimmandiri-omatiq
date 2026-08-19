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
            'nik' => ['nullable', 'string', 'size:16', Rule::unique('students', 'nik')->ignore($this->route('participant')?->student_id)],
            'full_name' => ['nullable', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:120'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'birth_place' => ['nullable', 'string', 'max:120'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'age' => ['nullable', 'integer', 'min:5', 'max:20'],
            'school_name' => ['nullable', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'regency_id' => ['nullable', 'exists:regencies,id'],
            'parent_phone' => ['nullable', 'string', 'max:30'],
            'photo' => ['nullable', 'file', 'image', 'max:2048'],
            'identity_card' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'family_card' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'student_card' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'payment_proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'payment_status' => ['nullable', Rule::in(['unpaid', 'waiting_confirmation', 'paid'])],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_note' => ['nullable', 'string'],
            'referral_source' => ['nullable', 'string', 'max:255'],
            'branch' => ['nullable', 'string', 'max:255'],
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
