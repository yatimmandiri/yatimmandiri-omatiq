<?php

namespace App\Models\Company;

use App\Models\Core\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventConsumptionLog extends Model
{
    public const DAILY_QUOTA = 3;

    public const COOLDOWN_MINUTES = 120; // Jeda 2 jam antar waktu makan resmi

    protected $fillable = [
        'consumable_type',
        'consumable_id',
        'event_date',
        'redeemed_at',
        'redeemed_by',
        'session_number',
        'notes',
    ];

    protected $casts = [
        'event_date' => 'date',
        'redeemed_at' => 'datetime',
        'session_number' => 'integer',
    ];

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'redeemed_by');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('event_date', today());
    }

    public function scopeForTarget(Builder $query, string $type, int $id): Builder
    {
        return $query->where('consumable_type', $type)->where('consumable_id', $id);
    }

    public static function countToday(string $type, int $id): int
    {
        return static::query()
            ->forTarget($type, $id)
            ->today()
            ->count();
    }

    public static function remainingToday(string $type, int $id): int
    {
        return max(0, self::DAILY_QUOTA - static::countToday($type, $id));
    }

    public static function getTodayLogs(string $type, int $id): array
    {
        return static::query()
            ->with('verifier:id,name')
            ->forTarget($type, $id)
            ->today()
            ->orderBy('redeemed_at', 'asc')
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'session_number' => $log->session_number,
                'redeemed_at' => $log->redeemed_at?->timezone('Asia/Jakarta')->format('H:i'),
                'redeemed_at_full' => $log->redeemed_at?->timezone('Asia/Jakarta')->translatedFormat('d M Y, H:i'),
                'verifier_name' => $log->verifier?->name ?? 'Sistem',
                'notes' => $log->notes,
            ])
            ->all();
    }

    public static function checkAvailability(string $type, int $id, int $cooldownMinutes = self::COOLDOWN_MINUTES): array
    {
        $currentCount = static::countToday($type, $id);
        $remaining = max(0, self::DAILY_QUOTA - $currentCount);

        if ($currentCount >= self::DAILY_QUOTA) {
            return [
                'can_redeem' => false,
                'reason' => 'exhausted',
                'remaining' => 0,
                'count' => $currentCount,
                'next_session' => null,
                'message' => 'Jatah konsumsi hari ini sudah habis (seluruh 3 porsi telah selesai diambil).',
                'next_available_time' => null,
            ];
        }

        $latestLog = static::query()
            ->forTarget($type, $id)
            ->today()
            ->latest('redeemed_at')
            ->first();

        if ($latestLog && $latestLog->redeemed_at) {
            $minutesDiff = $latestLog->redeemed_at->diffInMinutes(now());
            if ($minutesDiff < $cooldownMinutes) {
                $nextAvailableAt = $latestLog->redeemed_at->copy()->addMinutes($cooldownMinutes);
                $minutesLeft = $cooldownMinutes - $minutesDiff;

                return [
                    'can_redeem' => false,
                    'reason' => 'cooldown',
                    'remaining' => $remaining,
                    'count' => $currentCount,
                    'next_session' => $currentCount + 1,
                    'last_redeemed_time' => $latestLog->redeemed_at->timezone('Asia/Jakarta')->format('H:i'),
                    'last_session' => $latestLog->session_number,
                    'next_available_time' => $nextAvailableAt->timezone('Asia/Jakarta')->format('H:i'),
                    'minutes_left' => $minutesLeft,
                    'message' => "Porsi ke-{$latestLog->session_number} baru saja diambil pukul {$latestLog->redeemed_at->timezone('Asia/Jakarta')->format('H:i')} WIB. Sesi makan berikutnya tersedia pukul {$nextAvailableAt->timezone('Asia/Jakarta')->format('H:i')} WIB (jeda 2 jam antar waktu makan).",
                ];
            }
        }

        return [
            'can_redeem' => true,
            'reason' => 'ready',
            'remaining' => $remaining,
            'count' => $currentCount,
            'next_session' => $currentCount + 1,
            'message' => 'Siap diambil untuk Porsi ke-'.($currentCount + 1),
            'next_available_time' => null,
        ];
    }

    public static function redeem(string $type, int $id, ?int $userId = null, ?string $notes = null, bool $force = false): array
    {
        $currentCount = static::countToday($type, $id);
        if ($currentCount >= self::DAILY_QUOTA) {
            return [
                'success' => false,
                'message' => 'Jatah konsumsi hari ini sudah habis (maksimal 3x per hari).',
                'remaining' => 0,
            ];
        }

        // Validasi jeda 2 jam (kecuali di-force oleh Administrator)
        if (! $force) {
            $check = static::checkAvailability($type, $id);
            if (! $check['can_redeem']) {
                return [
                    'success' => false,
                    'message' => $check['message'],
                    'remaining' => $check['remaining'],
                    'is_cooldown' => ($check['reason'] === 'cooldown'),
                ];
            }
        }

        $sessionNumber = $currentCount + 1;

        $log = static::create([
            'consumable_type' => $type,
            'consumable_id' => $id,
            'event_date' => today(),
            'redeemed_at' => now(),
            'redeemed_by' => $userId,
            'session_number' => $sessionNumber,
            'notes' => $notes,
        ]);

        $remaining = max(0, self::DAILY_QUOTA - ($currentCount + 1));

        return [
            'success' => true,
            'message' => "Pengambilan konsumsi Porsi ke-{$sessionNumber} berhasil dicatat. Sisa jatah: {$remaining}x.",
            'remaining' => $remaining,
            'log' => $log,
        ];
    }

    public static function redeemBatchForChaperoneStudents(
        NationalChaperone $chaperone,
        array $participantIds,
        int $verifierId,
        bool $includeChaperone = false,
        bool $force = false,
        ?string $customNotes = null
    ): array {
        $chaperoneFormattedId = 'OFF-'.str_pad((string) $chaperone->id, 5, '0', STR_PAD_LEFT);
        $chaperoneNote = "Diambilkan oleh Pendamping: {$chaperone->name} ({$chaperoneFormattedId})";
        if ($customNotes) {
            $chaperoneNote .= " - {$customNotes}";
        }

        $participants = Participant::with('student:id,full_name')
            ->whereIn('id', $participantIds)
            ->get();

        $successList = [];
        $failedList = [];

        foreach ($participants as $participant) {
            $name = $participant->student?->full_name ?? $participant->registration_number;
            $res = static::redeem('participant', $participant->id, $verifierId, $chaperoneNote, force: $force);
            if ($res['success']) {
                $successList[] = "{$name} (Porsi ke-{$res['log']->session_number})";
            } else {
                $failedList[] = "{$name}: {$res['message']}";
            }
        }

        $chaperoneResult = null;
        if ($includeChaperone) {
            $chaperoneSelfNote = 'Porsi Pendamping bersama santri binaan'.($customNotes ? " - {$customNotes}" : '');
            $chaperoneResult = static::redeem('chaperone', $chaperone->id, $verifierId, $chaperoneSelfNote, force: $force);
        }

        $totalRedeemed = count($successList) + ($chaperoneResult && $chaperoneResult['success'] ? 1 : 0);

        return [
            'success' => $totalRedeemed > 0,
            'total_redeemed' => $totalRedeemed,
            'success_list' => $successList,
            'failed_list' => $failedList,
            'chaperone_redeemed' => $chaperoneResult && $chaperoneResult['success'],
            'message' => $totalRedeemed > 0
                ? "Berhasil mencatat pengambilan konsumsi untuk {$totalRedeemed} porsi!".(count($failedList) > 0 ? ' ('.count($failedList).' peserta dilewati karena kuota/cooldown)' : '')
                : 'Tidak ada porsi yang dapat diambil saat ini (semua peserta terpilih dalam masa cooldown atau kuota habis).',
        ];
    }
}
