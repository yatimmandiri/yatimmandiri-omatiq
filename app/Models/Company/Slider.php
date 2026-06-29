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

#[Fillable([
    'title',
    'subtitle',
    'featured_image',
    'url',
    'video_url',
    'olimpiade_id',
    'sort_order',
    'status',
])]

class Slider extends Model
{
    use LogsActivity, SoftDeletes;

    protected $appends = ['featured_image_url'];

    protected function casts(): array
    {
        return ['status' => 'boolean', 'sort_order' => 'integer'];
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        if (! $this->featured_image) {
            return null;
        }

        return Str::startsWith($this->featured_image, ['http://', 'https://'])
            ? $this->featured_image
            : '/storage/'.ltrim($this->featured_image, '/');
    }

    public function olimpiade(): BelongsTo
    {
        return $this->belongsTo(Olimpiade::class, 'olimpiade_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when($search, fn (Builder $query, string $search) => $query
            ->where(fn (Builder $query) => $query->where('title', 'like', "%{$search}%")
                ->orWhere('subtitle', 'like', "%{$search}%")));
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('System');
    }
}
