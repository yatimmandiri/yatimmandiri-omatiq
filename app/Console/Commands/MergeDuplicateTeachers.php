<?php

namespace App\Console\Commands;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MergeDuplicateTeachers extends Command
{
    protected $signature = 'omatiq:merge-teachers {--dry-run : Hanya tampilkan data yang akan digabung tanpa mengubah data} {--fix : Terapkan penggabungan data secara aman}';

    protected $description = 'Audit dan gabungkan akun guru duplikat secara aman (zero data loss)';

    public function handle(): int
    {
        $isFix = $this->option('fix');
        $isDryRun = $this->option('dry-run') || ! $isFix;

        $this->info('===============================================================');
        $this->info('           OMATIQ - MERGE DUPLICATE TEACHERS TOOL              ');
        $this->info('===============================================================');
        $this->line('Mode: '.($isDryRun ? '<comment>DRY-RUN (Simulasi / Baca Saja)</comment>' : '<fg=green;options=bold>EXECUTE / FIX (Aman, Tanpa Hapus Data)</>'));
        $this->line('');

        // 1. Group duplicate teachers by phone and name
        $teachers = User::role('Teacher')->get();

        $grouped = $teachers->groupBy(function (User $u) {
            $raw = preg_replace('/\D+/', '', (string) $u->phone);
            $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower(trim($u->name)));
            $firstWord = strtolower(explode(' ', trim($u->name))[0] ?? '');

            if (empty($raw)) {
                return 'name:'.$cleanName;
            }

            // Normalize 62... -> 0... for grouping key
            $trimmed = preg_replace('/^62/', '0', $raw);

            return 'teacher:'.$trimmed.':'.$firstWord;
        })->filter(fn ($group) => $group->count() > 1);

        if ($grouped->isEmpty()) {
            $this->info('Tidak ditemukan akun guru duplikat. Seluruh data guru rapi dan unik!');

            return self::SUCCESS;
        }

        $this->warn(sprintf('Ditemukan %d kelompok akun guru duplikat:', $grouped->count()));
        $this->line('');

        $totalMerged = 0;
        $totalParticipantsReassigned = 0;
        $totalStudentsReassigned = 0;

        foreach ($grouped as $key => $group) {
            $this->line('---------------------------------------------------------------');
            $this->info("Kelompok Identitas: {$key} (Jumlah Akun: {$group->count()})");

            // Sort to choose primary user:
            // 1. Participant count
            // 2. Student count
            // 3. Has real email (not @penyaluran.local)
            // 4. Completed profile
            // 5. Oldest ID
            $sorted = $group->sortByDesc(function (User $u) {
                $pCount = Participant::where('mentor_id', $u->id)->count();
                $sCount = Student::where('mentor_id', $u->id)->count();
                $hasRealEmail = ! str_ends_with((string) $u->email, '@penyaluran.local') ? 20 : 0;
                $completed = $u->teacher_profile_completed_at ? 50 : 0;

                return ($pCount * 100) + ($sCount * 10) + $completed + $hasRealEmail;
            })->values();

            $primary = $sorted->first();
            $secondaries = $sorted->slice(1);

            $primaryPCount = Participant::where('mentor_id', $primary->id)->count();
            $primarySCount = Student::where('mentor_id', $primary->id)->count();

            $this->line(sprintf(
                '  <fg=green>[AKUN UTAMA]</> ID: %d | Nama: %s | Email: %s | Penyaluran ID: %s | Peserta: %d | Santri: %d',
                $primary->id,
                $primary->name,
                $primary->email,
                $primary->penyaluran_id ?? 'NULL',
                $primaryPCount,
                $primarySCount
            ));

            foreach ($secondaries as $sec) {
                $secPCount = Participant::where('mentor_id', $sec->id)->count();
                $secSCount = Student::where('mentor_id', $sec->id)->count();

                $this->line(sprintf(
                    '  <fg=yellow>[DUPLIKAT]</>   ID: %d | Nama: %s | Email: %s | Penyaluran ID: %s | Peserta: %d | Santri: %d',
                    $sec->id,
                    $sec->name,
                    $sec->email,
                    $sec->penyaluran_id ?? 'NULL',
                    $secPCount,
                    $secSCount
                ));

                if (! $isDryRun) {
                    DB::transaction(function () use ($primary, $sec, &$totalParticipantsReassigned, &$totalStudentsReassigned, &$totalMerged) {
                        // Re-assign participants if any
                        $pUpdated = Participant::where('mentor_id', $sec->id)->update(['mentor_id' => $primary->id]);
                        $totalParticipantsReassigned += $pUpdated;

                        // Re-assign students if any
                        $sUpdated = Student::where('mentor_id', $sec->id)->update(['mentor_id' => $primary->id]);
                        $totalStudentsReassigned += $sUpdated;

                        // Adopt penyaluran_code / penyaluran_id to primary if primary lacked them
                        if (empty($primary->penyaluran_code) && ! empty($sec->penyaluran_code)) {
                            $primary->penyaluran_code = $sec->penyaluran_code;
                        }
                        if (empty($primary->penyaluran_id) && ! empty($sec->penyaluran_id)) {
                            $primary->penyaluran_id = $sec->penyaluran_id;
                        }
                        $primary->save();

                        // Safely archive duplicate email to prevent unique collision if placeholder
                        if (str_ends_with((string) $sec->email, '@penyaluran.local') && ! str_contains((string) $sec->email, '.merged_')) {
                            $sec->email = $sec->email.'.merged_'.$primary->id;
                            $sec->save();
                        }

                        $totalMerged++;
                    });
                }
            }
        }

        $this->line('===============================================================');
        if ($isDryRun) {
            $this->comment('Status: Simulasi selesai. Untuk menerapkan penggabungan akun secara aman, jalankan:');
            $this->line('  <fg=cyan>php artisan omatiq:merge-teachers --fix</>');
        } else {
            $this->info('Status: Penggabungan akun berhasil diselesaikan!');
            $this->info("  - Total Akun Duplikat yang Digabung: {$totalMerged}");
            $this->info("  - Total Pendaftaran Peserta yang Dialihkan: {$totalParticipantsReassigned}");
            $this->info("  - Total Santri Binaan yang Dialihkan: {$totalStudentsReassigned}");
        }

        return self::SUCCESS;
    }
}
