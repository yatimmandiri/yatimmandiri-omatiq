<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class StoreOlimpiadeGalleryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'olimpiade_id' => ['nullable', 'integer', 'exists:olimpiades,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'boolean'],
        ];
    }
}
