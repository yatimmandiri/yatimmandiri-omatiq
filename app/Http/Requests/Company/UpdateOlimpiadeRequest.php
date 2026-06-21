<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOlimpiadeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $olimpiade = $this->route('olimpiade');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('olimpiades', 'name')->ignore($olimpiade),
            ],
            'category' => ['required', 'string', 'max:100'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'description' => ['required', 'string'],
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'featured_image_url' => ['nullable', 'url:http,https', 'max:2048'],
            'duration' => ['nullable', 'string', 'max:100'],
            'level' => ['nullable', 'string', 'max:100'],
            'benefits' => ['required', 'array', 'min:1'],
            'benefits.*' => ['required', 'string', 'max:255'],
            'overview_title' => ['nullable', 'string', 'max:255'],
            'overview_description' => ['nullable', 'string'],
            'objective_ids' => ['nullable', 'array'],
            'objective_ids.*' => ['integer', 'exists:olimpiade_objectives,id'],
            'gallery_ids' => ['nullable', 'array'],
            'gallery_ids.*' => ['integer', 'exists:olimpiade_galleries,id'],
            'video_ids' => ['nullable', 'array'],
            'video_ids.*' => ['integer', 'exists:olimpiade_videos,id'],
            'cta_description' => ['nullable', 'string'],
            'registration_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['sometimes', 'boolean'],
            'recommended' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
