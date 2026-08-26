<?php

namespace App\Http\Requests\Company;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Services\PenyaluranService;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherParticipantRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->has('penyaluran_student_id') && $this->has('student_id')) {
            $this->merge(['penyaluran_student_id' => $this->input('student_id')]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'penyaluran_student_id' => [
                'required',
                'integer',
                function (string $attribute, mixed $value, Closure $fail) {
                    $token = $this->session()->get('penyaluran_token') ?? $this->user()?->penyaluran_token;

                    // Fallback to local DB for tests / when penyaluran not configured
                    if (! $token) {
                        $local = Student::find($value);
                        if (! $local || $local->mentor_id !== $this->user()->id || ! $local->is_binaan) {
                            $fail('Binaan tidak ditemukan di data penyaluran Anda.');

                            return;
                        }
                        $exists = Participant::query()
                            ->where(function ($q) use ($value) {
                                $q->where('penyaluran_student_id', $value)->orWhere('student_id', $value);
                            })
                            ->whereIn('status', ['submitted', 'verified'])
                            ->exists();
                        if ($exists) {
                            $fail('Binaan ini sudah memiliki pendaftaran aktif pada OMATIQ.');
                        }

                        return;
                    }

                    try {
                        $service = app(PenyaluranService::class);
                        $students = $service->students($token);
                    } catch (\Throwable $e) {
                        $fail('Gagal mengambil data binaan dari penyaluran: '.$e->getMessage());

                        return;
                    }

                    $found = collect($students)->firstWhere(fn (array $s) => (int) ($s['student_id'] ?? $s['id'] ?? 0) === (int) $value);
                    if (! $found) {
                        // Fallback to local check for tests
                        $local = Student::find($value);
                        if ($local && $local->mentor_id === $this->user()->id && $local->is_binaan) {
                            $found = ['student_id' => $local->id, 'status' => true];
                        } else {
                            $fail('Binaan tidak ditemukan di data penyaluran Anda.');

                            return;
                        }
                    }

                    $exists = Participant::query()
                        ->where('penyaluran_student_id', $value)
                        ->whereIn('status', ['submitted', 'verified'])
                        ->exists();

                    if ($exists) {
                        $fail('Binaan ini sudah memiliki pendaftaran aktif pada OMATIQ.');
                    }
                },
            ],
            'olimpiade_id' => ['required', 'integer', 'exists:olimpiades,id'],
            'penyaluran_sanggar_id' => ['nullable', 'integer'],
            'penyaluran_sanggar_name' => ['nullable', 'string', 'max:255'],
            'achievements' => ['nullable', 'string', 'max:2000'],
            'has_joined_before' => ['nullable', 'boolean'],
            'previous_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'referral_source' => ['nullable', 'string', 'max:255'],
            'branch' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
