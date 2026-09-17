<?php

namespace App\Models\Core;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'phone', 'branch', 'penyaluran_id', 'penyaluran_code', 'penyaluran_token', 'phone_verified_at', 'teacher_profile_completed_at', 'phone_otp', 'phone_otp_expires_at', 'phone_otp_attempts', 'phone_otp_last_sent_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'penyaluran_token', 'phone_otp'])]

class User extends Authenticatable
{
    use HasFactory, HasRoles, LogsActivity, Notifiable, TwoFactorAuthenticatable;

    public function getBranchName(): ?string
    {
        if (! empty($this->branch)) {
            return trim($this->branch);
        }

        if ($this->hasRole('Cabang')) {
            $clean = trim(preg_replace('/^(user\s+)?(kantor\s+)?cabang\s+/i', '', (string) $this->name));

            return $clean !== '' ? $clean : null;
        }

        return null;
    }

    public function scopeForBranch(Builder $query, ?string $branch): Builder
    {
        return $query->when(filled($branch), function (Builder $q) use ($branch) {
            $q->where(function (Builder $sub) use ($branch) {
                $sub->where('branch', $branch)
                    ->orWhere('branch', 'like', "%{$branch}%");
            });
        });
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'teacher_profile_completed_at' => 'datetime',
            'phone_otp_expires_at' => 'datetime',
            'phone_otp_last_sent_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function hasVerifiedEmail(): bool
    {
        if ($this->hasRole('Teacher') || $this->hasRole('Participant')) {
            return true;
        }

        return ! is_null($this->email_verified_at);
    }

    public function markPhoneAsVerified(): bool
    {
        return $this->forceFill([
            'phone_verified_at' => $this->freshTimestamp(),
            'phone_otp' => null,
            'phone_otp_expires_at' => null,
            'phone_otp_attempts' => 0,
        ])->save();
    }

    public function needsTeacherProfileCompletion(): bool
    {
        return $this->hasRole('Teacher')
            && is_null($this->teacher_profile_completed_at)
            && str_ends_with((string) $this->email, '@penyaluran.local');
    }

    public function participant(): HasOne
    {
        return $this->hasOne(Participant::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class, 'mentor_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'mentor_id');
    }

    public function socials(): HasMany
    {
        return $this->hasMany(Social::class);
    }

    public function resolvedPermissions()
    {
        return $this->roles()
            ->with('permissions')
            ->get()
            ->flatMap(fn ($role) => $role->permissions)
            ->pluck('name')
            ->unique()
            ->values();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('System');
    }

    public function scopeSearch(Builder $query, ?string $search)
    {
        return $query->when($search, function ($q, $search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }
}
