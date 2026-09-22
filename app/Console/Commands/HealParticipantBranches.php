<?php

namespace App\Console\Commands;

use App\Concerns\Traits\LogActivity;
use App\Models\Company\Participant;
use App\Models\Core\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class HealParticipantBranches extends Command
{
    use LogActivity;

    protected $signature = 'omatiq:heal-branches {--dry-run : Preview perbaikan cabang tanpa mengubah DB} {--force : Jalankan update langsung tanpa konfirmasi}';

    protected $description = 'Selaraskan kolom branch pada peserta binaan agar sesuai dengan cabang resmi guru pendampingnya';

    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');

        $participants = Participant::with(['student', 'mentor'])
            ->where(function ($q) {
                $q->where('registration_type', 'teacher')
                    ->orWhereNotNull('mentor_id')
                    ->orWhereNotNull('penyaluran_sanggar_name');
            })
            ->get();

        $this->info("Total peserta binaan di DB: {$participants->count()}");

        $toUpdate = [];

        foreach ($participants as $p) {
            $mentor = $p->mentor ?? ($p->student?->mentor_id ? User::find($p->student->mentor_id) : null);
            $mentorBranch = trim((string) ($mentor?->branch ?? ''));
            $participantBranch = trim((string) $p->branch);

            if ($mentor && $mentorBranch !== '' && strcasecmp($mentorBranch, $participantBranch) !== 0) {
                $toUpdate[] = [
                    'participant' => $p,
                    'mentor' => $mentor,
                    'old_branch' => $participantBranch,
                    'new_branch' => $mentorBranch,
                ];
            }
        }

        if (empty($toUpdate)) {
            $this->info('Semua data cabang peserta binaan sudah selaras dengan cabang guru pendamping.');

            return self::SUCCESS;
        }

        $this->newLine();
        $this->warn('Ditemukan '.count($toUpdate).' data peserta binaan dengan cabang yang mismatch:');
        $this->table(
            ['No Reg', 'Nama Siswa', 'Sanggar', 'Guru Pendamping', 'Cabang Saat Ini', 'Cabang Baru (Guru)'],
            array_map(fn ($r) => [
                $r['participant']->registration_number,
                $r['participant']->student?->full_name ?? '-',
                $r['participant']->penyaluran_sanggar_name ?? '-',
                "#{$r['mentor']->id} {$r['mentor']->name}",
                $r['old_branch'] ?: '(kosong)',
                $r['new_branch'],
            ], $toUpdate)
        );

        if ($isDryRun) {
            $this->newLine();
            $this->comment('Mode DRY-RUN aktif — tidak ada perubahan yang disimpan ke database.');
            $this->info('Jalankan tanpa --dry-run untuk mengeksekusi sinkronisasi cabang.');

            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm('Lanjutkan sinkronisasi cabang untuk '.count($toUpdate).' peserta ini?', true)) {
            $this->warn('Dibatalkan.');

            return self::SUCCESS;
        }

        $updatedCount = 0;
        DB::transaction(function () use ($toUpdate, &$updatedCount) {
            foreach ($toUpdate as $r) {
                /** @var Participant $p */
                $p = $r['participant'];
                $oldBranch = $p->branch;
                $p->branch = $r['new_branch'];
                $p->save();

                $this->logSuccess('heal-participant-branch', "Sinkronisasi cabang peserta {$p->registration_number}: {$oldBranch} -> {$r['new_branch']}", [
                    'participant_id' => $p->id,
                    'registration_number' => $p->registration_number,
                    'old_branch' => $oldBranch,
                    'new_branch' => $r['new_branch'],
                    'mentor_id' => $r['mentor']->id,
                ]);

                $updatedCount++;
            }
        });

        $this->newLine();
        $this->info("BERHASIL! {$updatedCount} data peserta binaan telah disinkronkan ke cabang guru pendampingnya.");

        return self::SUCCESS;
    }
}
