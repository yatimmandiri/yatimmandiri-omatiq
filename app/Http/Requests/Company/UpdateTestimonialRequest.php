<?php

namespace App\Http\Requests\Company;

class UpdateTestimonialRequest extends StoreTestimonialRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'avatar_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
