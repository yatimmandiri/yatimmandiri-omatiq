<?php

namespace App\Http\Requests\Company;

class UpdateOlimpiadeGalleryRequest extends StoreOlimpiadeGalleryRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['image'] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];

        return $rules;
    }
}
