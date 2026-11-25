<?php

namespace App\Http\Requests\Company;

use App\Models\Company\EventGuest;
use Illuminate\Foundation\Http\FormRequest;

class StoreEventGuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', EventGuest::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:150'],
            'position' => ['nullable', 'string', 'max:150'],
            'category' => ['required', 'in:vip,non_vip,non-vip,vvip,tokoh,sponsor,umum,press,media'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'table_number' => ['nullable', 'string', 'max:50'],
            'seat_count' => ['nullable', 'integer', 'min:1', 'max:50'],
            'status' => ['nullable', 'in:invited,confirmed,attended,declined'],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'send_invitation' => ['nullable', 'boolean'],
        ];
    }
}
