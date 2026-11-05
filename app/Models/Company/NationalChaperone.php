<?php

namespace App\Models\Company;

use App\Models\Core\Region\District;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\Region\Village;
use App\Models\Core\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'created_by',
    'branch',
    'kantor_id',
    'source_type',
    'penyaluran_teacher_id',
    'name',
    'nik',
    'gender',
    'shirt_size',
    'phone',
    'email',
    'position',
    'birth_place',
    'birth_date',
    'address',
    'province_id',
    'regency_id',
    'district_id',
    'village_id',
    'status',
    'verified_by',
    'verified_at',
    'notes',
])]
class NationalChaperone extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'verified_at' => 'datetime',
            'kantor_id' => 'integer',
            'penyaluran_teacher_id' => 'integer',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('System');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_id');
    }

    public function regency(): BelongsTo
    {
        return $this->belongsTo(Regency::class, 'regency_id');
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class, 'district_id');
    }

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(
            Participant::class,
            'national_chaperone_participants',
            'national_chaperone_id',
            'participant_id'
        )->withTimestamps();
    }

    public function scopeForBranch(Builder $query, ?string $branch, ?int $kantorId = null): Builder
    {
        if (empty($branch) && empty($kantorId)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($branch, $kantorId) {
            if ($kantorId) {
                $q->where('kantor_id', $kantorId);
            }
            if ($branch) {
                $branchUpper = strtoupper(trim($branch));
                $q->orWhereRaw('UPPER(branch) = ?', [$branchUpper]);
            }
        });
    }

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('status', 'verified');
    }

    public function scopeSubmitted(Builder $query): Builder
    {
        return $query->where('status', 'submitted');
    }
}
