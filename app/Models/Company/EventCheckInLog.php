<?php

namespace App\Models\Company;

use App\Models\Core\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventCheckInLog extends Model
{
    public const TOTAL_DAYS = 4;

    public const DAY_CONFIG = [
        1 => [
            'name' => 'Hari 1',
            'title' => 'Kedatangan & Penginapan',
            'subtitle' => 'Check-in Asrama & Pengambilan Pack',
            'default_checkpoint' => 'penginapan',
            'default_checkpoint_label' => 'Penginapan / Asrama',
        ],
        2 => [
            'name' => 'Hari 2',
            'title' => 'Venue Lomba (Hari 1)',
            'subtitle' => 'Penyisihan / Sesi Pagi',
            'default_checkpoint' => 'venue_lomba',
            'default_checkpoint_label' => 'Venue Perlombaan Gate Utama',
        ],
        3 => [
            'name' => 'Hari 3',
            'title' => 'Venue Lomba (Hari 2)',
            'subtitle' => 'Babak Final & Pengumuman',
            'default_checkpoint' => 'venue_lomba',
            'default_checkpoint_label' => 'Venue Perlombaan Gate Utama',
        ],
        4 => [
            'name' => 'Hari 4',
            'title' => 'Study Tour & Jamuan Ramah Tamah',
            'subtitle' => 'Wisata Edukasi & Makan Bersama Kontingen',
            'default_checkpoint' => 'study_tour',
            'default_checkpoint_label' => 'Study Tour & Jamuan Ramah Tamah',
        ],
    ];

    public const CHECKPOINT_OPTIONS = [
        'penginapan' => 'Penginapan / Asrama & Kumpul Bus',
        'kunjungan_mentan' => 'Kunjungan Kediaman Menteri Pertanian',
        'meet_greet_tokoh' => 'Meet & Greet Tokoh Nasional',
        'venue_lomba' => 'Venue Perlombaan (Gate Utama)',
        'presscon' => 'Portal Presscon & Media',
        'study_tour' => 'Study Tour & Wisata Edukasi',
        'ramah_tamah' => 'Jamuan Ramah Tamah / Gala Dinner',
        'gate_umum' => 'Gate Akses Terpadu',
    ];

    protected $fillable = [
        'target_type',
        'target_id',
        'event_date',
        'day_number',
        'checkpoint',
        'checkpoint_label',
        'checked_in_at',
        'checked_in_by',
        'notes',
    ];

    protected $casts = [
        'event_date' => 'date',
        'checked_in_at' => 'datetime',
        'day_number' => 'integer',
    ];

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('event_date', today());
    }

    public function scopeForTarget(Builder $query, string $type, int $id): Builder
    {
        return $query->where('target_type', $type)->where('target_id', $id);
    }

    public static function recordCheckIn(
        string $type,
        int $id,
        int $dayNumber = 1,
        string $checkpoint = 'penginapan',
        ?string $checkpointLabel = null,
        ?int $verifierId = null,
        ?string $notes = null
    ): array {
        $today = today()->toDateString();
        $label = $checkpointLabel ?: (self::CHECKPOINT_OPTIONS[$checkpoint] ?? ucwords(str_replace('_', ' ', $checkpoint)));

        $existing = static::query()
            ->forTarget($type, $id)
            ->whereDate('event_date', $today)
            ->where('checkpoint', $checkpoint)
            ->first();

        if ($existing) {
            return [
                'is_new' => false,
                'log' => $existing,
                'message' => "Sudah melakukan check-in hari ini di pos {$existing->checkpoint_label} pada pukul {$existing->checked_in_at?->timezone('Asia/Jakarta')->format('H:i')} WIB.",
            ];
        }

        $log = static::create([
            'target_type' => $type,
            'target_id' => $id,
            'event_date' => $today,
            'day_number' => max(1, min(self::TOTAL_DAYS, $dayNumber)),
            'checkpoint' => $checkpoint,
            'checkpoint_label' => $label,
            'checked_in_at' => now(),
            'checked_in_by' => $verifierId,
            'notes' => $notes,
        ]);

        return [
            'is_new' => true,
            'log' => $log,
            'message' => "Auto Check-In Berhasil! Hadir di {$label} (Hari {$log->day_number}) pukul {$log->checked_in_at->timezone('Asia/Jakarta')->format('H:i')} WIB.",
        ];
    }

    public static function getTimeline(string $type, int $id): array
    {
        $logs = static::query()
            ->with('verifier:id,name')
            ->forTarget($type, $id)
            ->orderBy('day_number', 'asc')
            ->orderBy('checked_in_at', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $logsByDay = [];
        foreach ($logs as $log) {
            $day = (int) $log->day_number;
            if (! isset($logsByDay[$day])) {
                $logsByDay[$day] = [];
            }
            $logsByDay[$day][] = [
                'id' => $log->id,
                'checkpoint' => $log->checkpoint,
                'checkpoint_label' => $log->checkpoint_label,
                'checked_in_at' => $log->checked_in_at?->timezone('Asia/Jakarta')->format('H:i').' WIB',
                'checked_in_date' => $log->checked_in_at?->timezone('Asia/Jakarta')->translatedFormat('d M Y'),
                'verifier_name' => $log->verifier?->name ?? 'Verifikator Panitia',
                'notes' => $log->notes,
            ];
        }

        $timeline = [];
        for ($day = 1; $day <= self::TOTAL_DAYS; $day++) {
            $cfg = self::DAY_CONFIG[$day] ?? [
                'name' => "Hari {$day}",
                'title' => "Agenda Hari {$day}",
                'subtitle' => 'Kegiatan OMATIQ 2026',
                'default_checkpoint' => 'venue_lomba',
                'default_checkpoint_label' => 'Venue Perlombaan',
            ];

            $dayLogs = $logsByDay[$day] ?? [];
            $primaryLog = $dayLogs[0] ?? null;

            $timeline[] = [
                'day_number' => $day,
                'name' => $cfg['name'],
                'title' => $cfg['title'],
                'subtitle' => $cfg['subtitle'],
                'is_checked_in' => ! empty($dayLogs),
                'primary_time' => $primaryLog['checked_in_at'] ?? null,
                'primary_date' => $primaryLog['checked_in_date'] ?? null,
                'primary_checkpoint' => $primaryLog['checkpoint_label'] ?? $cfg['default_checkpoint_label'],
                'primary_verifier' => $primaryLog['verifier_name'] ?? null,
                'all_logs' => $dayLogs,
            ];
        }

        return $timeline;
    }

    public static function getTodayCheckIn(string $type, int $id, ?string $checkpoint = null): ?self
    {
        return static::query()
            ->forTarget($type, $id)
            ->today()
            ->when($checkpoint, fn ($q) => $q->where('checkpoint', $checkpoint))
            ->latest('checked_in_at')
            ->first();
    }

    /**
     * Reset / delete check-in logs for a target.
     * Can reset a single specific log by logId, or all logs for a specific day, or all logs today.
     */
    public static function resetCheckIn(string $type, int $id, ?int $logId = null, ?int $dayNumber = null): int
    {
        $query = static::query()->forTarget($type, $id);

        if ($logId) {
            $query->where('id', $logId);
        } elseif ($dayNumber) {
            $query->where('day_number', $dayNumber);
        } else {
            $query->today();
        }

        return $query->delete();
    }
}
