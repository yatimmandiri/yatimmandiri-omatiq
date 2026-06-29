<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable(['name', 'role', 'quote', 'avatar', 'rating', 'focus', 'sort_order', 'status', 'olimpiade_id'])]
class Testimonial extends Model
{
    use LogsActivity, SoftDeletes;

    protected $appends = ['avatar_url'];

    public function olimpiades(): BelongsTo
    {
        return $this->belongsTo(Olimpiade::class, 'olimpiade_id');
    }

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'sort_order' => 'integer',
            'status' => 'boolean',
        ];
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar) {
            return null;
        }

        if (Str::startsWith($this->avatar, ['http://', 'https://'])) {
            return $this->avatar;
        }

        return '/storage/'.ltrim($this->avatar, '/');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', true);
    }

    public function scopeType(Builder $query, ?string $type): Builder
    {
        return $query->when($type, fn (Builder $query, string $type) => $query->where('type', $type));
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when($search, fn (Builder $query, string $search) => $query
            ->where(fn (Builder $query) => $query->where('name', 'like', "%{$search}%")
                ->orWhere('role', 'like', "%{$search}%")
                ->orWhere('quote', 'like', "%{$search}%")));
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->useLogName('System');
    }
}
