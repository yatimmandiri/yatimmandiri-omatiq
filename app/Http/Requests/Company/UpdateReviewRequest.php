<?php

namespace App\Http\Requests\Company;

class UpdateReviewRequest extends StoreReviewRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'avatar_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
