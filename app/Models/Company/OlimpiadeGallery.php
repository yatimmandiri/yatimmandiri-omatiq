<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable(['olimpiade_id', 'title', 'image_url', 'alt_text', 'caption', 'sort_order', 'status'])]
class OlimpiadeGallery extends Model
{
    use LogsActivity, SoftDeletes;

    protected $appends = ['image_src'];

    protected function casts(): array
    {
        return ['status' => 'boolean', 'sort_order' => 'integer'];
    }

    public function olimpiade(): BelongsTo
    {
        return $this->belongsTo(Olimpiade::class);
    }

    public function getImageSrcAttribute(): string
    {
        return Str::startsWith($this->image_url, ['http://', 'https://'])
            ? $this->image_url
            : Storage::disk('public')->url($this->image_url);
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
                ->orWhere('caption', 'like', "%{$search}%")));
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->useLogName('System');
    }
}
