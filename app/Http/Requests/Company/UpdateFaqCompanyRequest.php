<?php

namespace App\Http\Requests\Company;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateFaqCompanyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:255'],
            'answer' => ['required', 'string'],
            'olimpiade_id' => ['required', 'exists:olimpiades,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'boolean'],
        ];
    }
}
