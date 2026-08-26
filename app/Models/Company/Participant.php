<?php

namespace App\Models\Company;

use App\Models\Core\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'registration_number',
    'olimpiade_id',
    'user_id',
    'student_id',
    'penyaluran_student_id',
    'penyaluran_student_name',
    'penyaluran_student_nik',
    'penyaluran_student_nis',
    'penyaluran_student_gender',
    'penyaluran_student_school_name',
    'penyaluran_student_school_level',
    'penyaluran_student_class',
    'penyaluran_student_birth_date',
    'penyaluran_sanggar_id',
    'penyaluran_sanggar_name',
    'nik',
    'registration_type',
    'mentor_id',
    'achievements',
    'has_joined_before',
    'previous_year',
    'referral_source',
    'branch',
    'payment_status',
    'payment_proof_path',
    'payment_amount',
    'payment_note',
    'data_truth_consent',
    'documentation_consent',
    'rules_consent',
    'participant_signature_name',
    'guardian_signature_name',
    'status',
    'notes',
])]
class Participant extends Model
{
    use HasFactory, LogsActivity;

    protected function casts(): array
    {
        return [
            'has_joined_before' => 'boolean',
            'data_truth_consent' => 'boolean',
            'documentation_consent' => 'boolean',
            'rules_consent' => 'boolean',
            'penyaluran_student_birth_date' => 'date',
        ];
    }

    public function olimpiade(): BelongsTo
    {
        return $this->belongsTo(Olimpiade::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when(
            $search,
            fn (Builder $query, string $search) => $query->where(function (Builder $query) use ($search) {
                $query->where('registration_number', 'like', "%{$search}%")
                    ->orWhere('penyaluran_student_name', 'like', "%{$search}%")
                    ->orWhere('penyaluran_student_nik', 'like', "%{$search}%")
                    ->orWhereHas('student', fn (Builder $q) => $q->where('full_name', 'like', "%{$search}%"))
                    ->orWhereHas('student', fn (Builder $q) => $q->where('school_name', 'like', "%{$search}%"))
                    ->orWhereHas('student', fn (Builder $q) => $q->where('parent_phone', 'like', "%{$search}%"))
                    ->orWhereHas('olimpiade', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"));
            }),
        );
    }

    public function getFullNameAttribute(): ?string
    {
        return $this->penyaluran_student_name ?? $this->student?->full_name ?? $this->user?->name;
    }

    public function getPaymentProofUrlAttribute(): ?string
    {
        return $this->storageUrl($this->payment_proof_path);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('System');
    }

    private function storageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return '/storage/'.ltrim($path, '/');
    }
}
