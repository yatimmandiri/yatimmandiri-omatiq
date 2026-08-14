<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $teacher = $this->route('teacher');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($teacher->id)],
            'password' => ['nullable', 'confirmed'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->password === null) {
            $this->request->remove('password');
        }
    }
}
