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
    'participant_id',
    'qualified_by',
    'qualified_at',
    'status',
    'availability_letter_path',
    'payment_proof_path',
    'payment_status',
    'payment_amount',
    'registered_at',
    'notes',
])]
class NationalParticipant extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $appends = [
        'availability_letter_url',
        'payment_proof_url',
    ];

    protected function casts(): array
    {
        return [
            'qualified_at' => 'datetime',
            'registered_at' => 'datetime',
            'payment_amount' => 'decimal:2',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('System');
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function qualifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'qualified_by');
    }

    public function getAvailabilityLetterUrlAttribute(): ?string
    {
        return $this->storageUrl($this->availability_letter_path);
    }

    public function getPaymentProofUrlAttribute(): ?string
    {
        return $this->storageUrl($this->payment_proof_path);
    }

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('status', 'verified');
    }

    public function scopeWaitingConfirmation(Builder $query): Builder
    {
        return $query->where('status', 'waiting_confirmation');
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
