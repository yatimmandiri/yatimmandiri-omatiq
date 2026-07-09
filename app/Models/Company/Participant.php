<?php

namespace App\Models\Company;

use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'registration_number',
    'olimpiade_id',
    'full_name',
    'nickname',
    'gender',
    'birth_place',
    'birth_date',
    'age',
    'education_level',
    'school_name',
    'grade',
    'address',
    'province_id',
    'regency_id',
    'parent_phone',
    'development_program',
    'development_program_other',
    'institution_name',
    'branch_office',
    'mentor_name',
    'mentor_phone',
    'achievements',
    'has_joined_before',
    'previous_year',
    'photo_path',
    'identity_card_path',
    'recommendation_letter_path',
    'achievement_certificate_path',
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
    use LogsActivity, SoftDeletes;

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'age' => 'integer',
            'has_joined_before' => 'boolean',
            'data_truth_consent' => 'boolean',
            'documentation_consent' => 'boolean',
            'rules_consent' => 'boolean',
        ];
    }

    public function olimpiade(): BelongsTo
    {
        return $this->belongsTo(Olimpiade::class);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function regency(): BelongsTo
    {
        return $this->belongsTo(Regency::class);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when(
            $search,
            fn (Builder $query, string $search) => $query->where(function (Builder $query) use ($search) {
                $query->where('registration_number', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('school_name', 'like', "%{$search}%")
                    ->orWhere('parent_phone', 'like', "%{$search}%")
                    ->orWhereHas('olimpiade', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"));
            }),
        );
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->storageUrl($this->photo_path);
    }

    public function getIdentityCardUrlAttribute(): ?string
    {
        return $this->storageUrl($this->identity_card_path);
    }

    public function getRecommendationLetterUrlAttribute(): ?string
    {
        return $this->storageUrl($this->recommendation_letter_path);
    }

    public function getAchievementCertificateUrlAttribute(): ?string
    {
        return $this->storageUrl($this->achievement_certificate_path);
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
