<?php

namespace App\Http\Requests\Company;

use App\Models\Company\Student;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => [
                'required',
                'integer',
                'exists:students,id',
                function (string $attribute, mixed $value, Closure $fail) {
                    $student = Student::find($value);

                    if (! $student) {
                        $fail('Binaan tidak ditemukan.');

                        return;
                    }

                    if ($student->mentor_id !== $this->user()->id || ! $student->is_binaan) {
                        $fail('Binaan ini bukan binaan Anda.');

                        return;
                    }

                    if ($student->hasActiveRegistration()) {
                        $fail('Binaan ini sudah memiliki pendaftaran aktif pada OMATIQ.');
                    }
                },
            ],
            'olimpiade_id' => ['required', 'integer', 'exists:olimpiades,id'],
        ];
    }
}
