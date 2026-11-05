<?php

namespace App\Http\Requests\Company;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNationalChaperoneRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['Administrators', 'Cabang']) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'source_type' => ['required', 'in:guru,karyawan,lainnya'],
            'penyaluran_teacher_id' => ['nullable', 'integer'],
            'branch' => ['nullable', 'string', 'max:100'],
            'kantor_id' => ['nullable', 'integer'],
            'name' => ['required', 'string', 'max:255'],
            'nik' => ['required', 'string', 'size:16'],
            'gender' => ['required', 'in:male,female'],
            'shirt_size' => ['required', 'string', 'in:XS,S,M,L,XL,XXL,XXXL'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'position' => ['nullable', 'string', 'max:100'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'regency_id' => ['nullable', 'exists:regencies,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
            'participant_ids' => ['nullable', 'array'],
            'participant_ids.*' => ['integer', 'exists:participants,id'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * Custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'source_type' => 'asal pendamping',
            'name' => 'nama lengkap',
            'nik' => 'NIK',
            'gender' => 'jenis kelamin',
            'shirt_size' => 'ukuran kaos / baju pendamping',
            'phone' => 'nomor HP / WhatsApp',
            'position' => 'jabatan / instansi',
            'province_id' => 'provinsi',
            'regency_id' => 'kabupaten / kota',
            'district_id' => 'kecamatan',
            'village_id' => 'desa / kelurahan',
            'participant_ids' => 'peserta yang didampingi',
        ];
    }
}
