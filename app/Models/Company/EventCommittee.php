<?php

namespace App\Models\Company;

use App\Models\Core\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'code',
    'user_id',
    'created_by',
    'name',
    'nik',
    'gender',
    'phone',
    'email',
    'division',
    'position',
    'access_zone',
    'photo_path',
    'status',
    'checked_in_at',
    'notes',
    'event_year',
])]
class EventCommittee extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
            'event_year' => 'integer',
            'user_id' => 'integer',
            'created_by' => 'integer',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('System');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (! $this->photo_path) {
            return null;
        }

        if (Str::startsWith($this->photo_path, ['http://', 'https://'])) {
            return $this->photo_path;
        }

        return '/storage/'.ltrim($this->photo_path, '/');
    }

    public static function generateCode(?int $eventYear = null): string
    {
        $eventYear ??= 2026;

        $lastRecord = static::withTrashed()
            ->where('event_year', $eventYear)
            ->where('code', 'like', 'CREW-%')
            ->orderByDesc('id')
            ->first();

        $sequence = 1;
        if ($lastRecord && preg_match('/CREW-0*(\d+)/i', $lastRecord->code, $matches)) {
            $sequence = ((int) $matches[1]) + 1;
        }

        return 'CREW-'.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when($search, function (Builder $q, string $term) {
            $q->where(function (Builder $sub) use ($term) {
                $sub->where('code', 'like', "%{$term}%")
                    ->orWhere('name', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%")
                    ->orWhere('nik', 'like', "%{$term}%")
                    ->orWhere('division', 'like', "%{$term}%")
                    ->orWhere('position', 'like', "%{$term}%");
            });
        });
    }
}
