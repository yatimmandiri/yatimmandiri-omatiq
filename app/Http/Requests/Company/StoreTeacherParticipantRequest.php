<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nik' => ['required', 'string', 'size:16', 'unique:participants,nik'],
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
        ];
    }
}
