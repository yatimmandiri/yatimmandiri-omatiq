<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JoinOlimpiadeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentId = $this->route('participant')?->student_id;

        return [
            'olimpiade_id' => [
                'required',
                'integer',
                Rule::exists('olimpiades', 'id'),
                Rule::unique('participants', 'olimpiade_id')->where(function ($query) use ($studentId) {
                    return $query->where('student_id', $studentId)
                        ->whereNull('deleted_at');
                }),
            ],
        ];
    }
}
