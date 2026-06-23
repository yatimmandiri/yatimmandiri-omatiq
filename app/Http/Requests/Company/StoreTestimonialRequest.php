<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
            'quote' => ['required', 'string', 'max:2000'],
            'avatar_file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'focus' => ['nullable', 'required_if:type,public_figure', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'boolean'],
            'olimpiade_id' => ['required', 'exists:olimpiades,id'],
        ];
    }
}
