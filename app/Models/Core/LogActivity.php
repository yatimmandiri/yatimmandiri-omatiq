<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Support\LogOptions;

class LogActivity extends Activity
{
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('System');
    }

    protected $casts = [
        'properties' => 'collection',
        'attribute_changes' => 'array',
    ];

    public function scopeSearch(Builder $query, ?string $search)
    {
        return $query->when(filled($search), function ($q) use ($search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('description', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%")
                    ->orWhere('subject_type', 'like', "%{$search}%")
                    ->orWhere('subject_id', 'like', "%{$search}%")
                    ->orWhere('attribute_changes', 'like', "%{$search}%")
                    ->orWhereHasMorph('causer', [User::class], function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        });
    }

    /**
     * Parse attribute_changes / properties into standard diff pairs:
     * [ ['field' => string, 'old' => mixed, 'new' => mixed] ]
     */
    public function getDiffFieldsAttribute(): array
    {
        $raw = $this->attribute_changes;
        if (is_string($raw)) {
            $raw = json_decode($raw, true) ?? [];
        }

        $attributes = $raw['attributes'] ?? $this->properties['attributes'] ?? [];
        $old = $raw['old'] ?? $this->properties['old'] ?? [];

        $diff = [];
        if (! empty($attributes)) {
            foreach ($attributes as $key => $newVal) {
                $oldVal = $old[$key] ?? null;
                $diff[] = [
                    'field' => $key,
                    'old' => $oldVal,
                    'new' => $newVal,
                ];
            }
        } elseif (! empty($old)) {
            foreach ($old as $key => $oldVal) {
                $diff[] = [
                    'field' => $key,
                    'old' => $oldVal,
                    'new' => null,
                ];
            }
        }

        return $diff;
    }

    /**
     * Get clean entity class name without namespace
     */
    public function getSubjectNameAttribute(): string
    {
        if (! $this->subject_type) {
            return '-';
        }

        return class_basename($this->subject_type);
    }
}
