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
            'nik' => ['nullable', 'string', 'size:16'],
            'gender' => ['required', 'in:male,female'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'division' => ['required', 'string', 'max:100'],
            'position' => ['nullable', 'string', 'max:100'],
            'access_zone' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'exists:users,id'],
            'status' => ['required', 'in:active,inactive'],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }
}
