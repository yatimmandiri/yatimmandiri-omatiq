<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $periodId = $this->route('period')?->id ?? $this->route('period');

        return [
            'name' => ['required', 'string', 'max:255'],
            'year' => [
                'required',
                'integer',
                'min:2020',
                'max:2099',
                Rule::unique('periods', 'year')->ignore($periodId),
            ],
            'is_active' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
