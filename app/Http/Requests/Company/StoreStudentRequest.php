<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nik' => ['required', 'string', 'size:16', 'unique:students,nik'],
            'full_name' => ['required', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:120'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'birth_place' => ['required', 'string', 'max:120'],
            'birth_date' => ['required', 'date', 'before:today'],
            'school_level' => ['nullable', 'string', 'max:30'],
            'nis' => ['nullable', 'string', 'max:20'],
            'school_name' => ['required', 'string', 'max:255'],
            'grade' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string'],
            'province_id' => ['required', 'exists:provinces,id'],
            'regency_id' => ['required', 'exists:regencies,id'],
            'parent_phone' => ['required', 'string', 'max:30'],
            'mentor_id' => ['nullable', 'integer', 'exists:users,id'],
            'mentor_name' => ['nullable', 'string', 'max:255'],
            'mentor_phone' => ['nullable', 'string', 'max:30'],
            'is_binaan' => ['nullable', 'boolean'],
            'photo' => ['nullable', 'file', 'image', 'max:2048'],
            'identity_card' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'family_card' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
        ];
    }
}
