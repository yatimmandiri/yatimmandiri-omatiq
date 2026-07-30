<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Sluggable\Attributes\Sluggable;

#[Fillable([
    'name',
    'slug',
    'category',
    'excerpt',
    'description',
    'featured_image',
    'duration',
    'level',
    'benefits',
    'overview_title',
    'overview_description',
    'objectives',
    'gallery',
    'videos',
    'cta_description',
    'registration_url',
    'status',
    'recommended',
    'sort_order',
    'show_on_registration',
])]
#[Sluggable(from: 'name', to: 'slug')]
class Olimpiade extends Model
{
    use LogsActivity, SoftDeletes;

    public function getFeaturedImageUrlAttribute(): ?string
    {
        if (! $this->featured_image) {
            return null;
        }

        if (Str::startsWith($this->featured_image, ['http://', 'https://'])) {
            return $this->featured_image;
        }

        return '/storage/'.ltrim($this->featured_image, '/');
    }

    protected function casts(): array
    {
        return [
            'benefits' => 'array',
            'objectives' => 'array',
            'gallery' => 'array',
            'videos' => 'array',
            'status' => 'boolean',
            'recommended' => 'boolean',
            'show_on_registration' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', true);
    }

    public function scopeRecommended(Builder $query): Builder
    {
        return $query->where('recommended', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when(
            $search,
            fn (Builder $query, string $search) => $query->where(function (Builder $query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            }),
        );
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('System');
    }

    public function objectiveItems(): HasMany
    {
        return $this->hasMany(OlimpiadeObjective::class)->ordered();
    }

    public function galleries(): HasMany
    {
        return $this->hasMany(OlimpiadeGallery::class)->ordered();
    }

    public function videoItems(): HasMany
    {
        return $this->hasMany(OlimpiadeVideo::class)->ordered();
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(OlimpiadeSchedule::class)->ordered();
    }
}
