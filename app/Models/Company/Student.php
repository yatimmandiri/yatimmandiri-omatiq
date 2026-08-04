<?php

namespace App\Models\Company;

use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'nik',
    'full_name',
    'nickname',
    'gender',
    'birth_place',
    'birth_date',
    'age',
    'school_name',
    'grade',
    'address',
    'province_id',
    'regency_id',
    'parent_phone',
    'mentor_id',
    'mentor_name',
    'mentor_phone',
    'photo_path',
    'identity_card_path',
    'family_card_path',
    'is_binaan',
])]
class Student extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'age' => 'integer',
            'is_binaan' => 'boolean',
        ];
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function regency(): BelongsTo
    {
        return $this->belongsTo(Regency::class);
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->storageUrl($this->photo_path);
    }

    public function getIdentityCardUrlAttribute(): ?string
    {
        return $this->storageUrl($this->identity_card_path);
    }

    public function getFamilyCardUrlAttribute(): ?string
    {
        return $this->storageUrl($this->family_card_path);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when(
            $search,
            fn (Builder $query, string $search) => $query->where(function (Builder $query) use ($search) {
                $query->where('full_name', 'like', "%{$search}%")
                    ->orWhere('school_name', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%");
            }),
        );
    }

    public const ACTIVE_STATUSES = ['submitted', 'verified'];

    public function hasActiveRegistration(): bool
    {
        return $this->participants()
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->exists();
    }

    public static function hasActiveRegistrationFor(string $nik): bool
    {
        return static::query()
            ->where('nik', $nik)
            ->whereHas('participants', fn (Builder $query) => $query->whereIn('status', self::ACTIVE_STATUSES))
            ->exists();
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
