<?php

namespace App\Http\Requests\Company;

use App\Models\Company\EventCommittee;
use Illuminate\Foundation\Http\FormRequest;

class StoreEventCommitteeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', EventCommittee::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'branch' => ['nullable', 'string', 'max:100'],
            'nik' => ['nullable', 'string', 'size:16'],
            'gender' => ['required', 'in:male,female'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'division' => ['required', 'string', 'max:100'],
            'position' => ['nullable', 'string', 'max:100'],
            'shirt_size' => ['required', 'string', 'in:XS,S,M,L,XL,XXL,XXXL'],
            'access_zone' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'exists:users,id'],
            'status' => ['required', 'in:active,inactive'],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nama lengkap panitia',
            'gender' => 'jenis kelamin',
            'division' => 'divisi kepanitiaan',
            'shirt_size' => 'ukuran kaos / baju panitia',
        ];
    }
}
