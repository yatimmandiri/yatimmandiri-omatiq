<?php

namespace App\Http\Requests\Company;

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Services\PenyaluranService;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

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

                    $olimpiade = $this->filled('olimpiade_id') ? Olimpiade::find($this->input('olimpiade_id')) : null;
                    $eventYear = $olimpiade?->event_year ?? 2026;

                    // Fallback to local DB for tests / when penyaluran not configured
                    if (! $token) {
                        $local = Student::find($value);
                        if (! $local || $local->mentor_id !== $this->user()->id || ! $local->is_binaan) {
                            $fail('Binaan tidak ditemukan di data penyaluran Anda.');

                            return;
                        }
                        $exists = Participant::query()
                            ->where(function ($q) use ($value) {
                                $q->where('penyaluran_student_id', $value)
                                    ->orWhereHas('student', fn ($qq) => $qq->where('penyaluran_id', $value)->orWhere('id', $value));
                            })
                            ->where(function ($q) use ($eventYear) {
                                $q->where('event_year', $eventYear);
                                if ($eventYear == 2026) {
                                    $q->orWhereNull('event_year');
                                }
                            })
                            ->whereIn('status', ['submitted', 'verified'])
                            ->exists();
                        if ($exists) {
                            $fail('Binaan ini sudah terdaftar di OMATIQ '.($eventYear ?? '').'.');
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
                        // Fallback to local check for tests (by penyaluran_id or id)
                        $local = Student::where('penyaluran_id', $value)->where('mentor_id', $this->user()->id)->where('is_binaan', true)->first()
                            ?? Student::find($value);
                        if ($local && $local->mentor_id === $this->user()->id && $local->is_binaan) {
                            $found = ['student_id' => $local->penyaluran_id ?? $local->id, 'status' => true];
                        } else {
                            $fail('Binaan tidak ditemukan di data penyaluran Anda.');

                            return;
                        }
                    }

                    // Check existing participant via penyaluran_student_id or Student for this event
                    $exists = Participant::query()
                        ->where(function ($q) use ($value) {
                            $q->where('penyaluran_student_id', $value)
                                ->orWhereHas('student', fn ($qq) => $qq->where('penyaluran_id', $value)->orWhere('id', $value));
                        })
                        ->where(function ($q) use ($eventYear) {
                            $q->where('event_year', $eventYear);
                            if ($eventYear == 2026) {
                                $q->orWhereNull('event_year');
                            }
                        })
                        ->whereIn('status', ['submitted', 'verified'])
                        ->exists();

                    if ($exists) {
                        $fail('Binaan ini sudah terdaftar di OMATIQ '.($eventYear ?? '').'.');
                    }
                },
            ],
            'olimpiade_id' => ['required', 'integer', 'exists:olimpiades,id'],
            'penyaluran_sanggar_id' => ['nullable', 'integer'],
            'penyaluran_sanggar_name' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'address' => ['nullable', 'string'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'regency_id' => ['nullable', 'exists:regencies,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
            'nickname' => ['nullable', 'string', 'max:120'],
            'birth_place' => ['nullable', 'string', 'max:120'],
            'age' => ['nullable', 'integer', 'min:5', 'max:20'],
            'parent_phone' => ['nullable', 'string', 'max:30'],
            'achievements' => ['nullable', 'string', 'max:2000'],
            'has_joined_before' => ['nullable', 'boolean'],
            'previous_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'referral_source' => ['nullable', 'string', 'max:255'],
            'branch' => ['nullable', 'string', 'max:255', function (string $attribute, mixed $value, $fail) {
                if (! $value) {
                    return;
                }
                $branches = Cache::remember('branch_offices', 3600, fn () => json_decode(Storage::disk('local')->get('branch-offices.json'), true) ?? []);
                $names = array_column($branches, 'name');
                if (! in_array($value, $names, true)) {
                    $fail('Cabang tidak valid.');
                }
            }],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
