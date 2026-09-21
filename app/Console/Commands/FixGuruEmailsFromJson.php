<?php

namespace App\Console\Commands;

use App\Models\Core\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FixGuruEmailsFromJson extends Command
{
    protected $signature = 'fix:guru-emails {--dry-run : Tampilkan preview tanpa update} {--execute : Update email di DB}';

    protected $description = 'Perbaiki email guru dari teacher.json (cocokkan phone & nama, bebaskan email yang tertukar tanpa coba prefix)';

    private function normPhone(?string $phone): string
    {
        $p = preg_replace('/[^0-9]/', '', (string) $phone);
        if (str_starts_with($p, '0')) {
            $p = '62'.substr($p, 1);
        } elseif (str_starts_with($p, '8')) {
            $p = '62'.$p;
        }

        return $p;
    }

    public function handle(): int
    {
        $isDryRun = $this->option('dry-run') || ! $this->option('execute');
        $jsonPath = public_path('storage/teacher.json');
        if (! file_exists($jsonPath)) {
            $jsonPath = storage_path('app/public/teacher.json');
        }
        if (! file_exists($jsonPath)) {
            $this->error('File teacher.json tidak ditemukan di public/storage/teacher.json atau storage/app/public/teacher.json');

            return self::FAILURE;
        }

        $json = json_decode(file_get_contents($jsonPath), true);
        if (! is_array($json)) {
            $this->error('Format teacher.json invalid.');

            return self::FAILURE;
        }

        $totalJson = count($json);
        $this->info("Total data di teacher.json: {$totalJson}");

        $allTeachers = User::role('Teacher')->get(['id', 'name', 'email', 'phone', 'penyaluran_id', 'branch', 'teacher_profile_completed_at']);
        $this->info("Total Teacher di DB: {$allTeachers->count()}");

        $dbByPhone = [];
        foreach ($allTeachers as $u) {
            $np = $this->normPhone($u->phone);
            if ($np !== '') {
                $dbByPhone[$np] = $u;
            }
        }

        $alreadyCorrect = [];
        $updates = [];
        $notYetRegistered = [];
        $conflictsToFree = [];

        foreach ($json as $row) {
            $np = $this->normPhone($row['phone'] ?? '');
            $jsonEmail = strtolower(trim($row['email'] ?? ''));
            $jsonName = trim($row['nama'] ?? '');
            $jsonKantor = trim($row['kantor'] ?? '');

            if (! filter_var($jsonEmail, FILTER_VALIDATE_EMAIL)) {
                $this->warn("Skip email invalid: {$jsonEmail} ({$jsonName} - {$row['phone']})");

                continue;
            }

            $user = $dbByPhone[$np] ?? null;

            if (! $user) {
                // Fallback match by exact name and matching branch
                $user = $allTeachers->first(function ($t) use ($jsonName, $jsonKantor) {
                    return strcasecmp($t->name, $jsonName) === 0 &&
                        (! $jsonKantor || stripos((string) $t->branch, $jsonKantor) !== false || stripos($jsonKantor, (string) $t->branch) !== false);
                });
            }

            if (! $user) {
                $notYetRegistered[] = $row;

                continue;
            }

            if (strcasecmp(trim((string) $user->email), $jsonEmail) === 0) {
                $alreadyCorrect[] = ['db' => $user, 'json' => $row];

                continue;
            }

            // Check if target email is currently held by someone else in DB
            $currentHolder = User::where('email', $jsonEmail)->first();
            $holderInfo = null;

            if ($currentHolder && $currentHolder->id !== $user->id) {
                $holderPlaceholder = 'guru'.($currentHolder->penyaluran_id ?: $currentHolder->id).'@penyaluran.local';
                $holderInfo = [
                    'id' => $currentHolder->id,
                    'name' => $currentHolder->name,
                    'phone' => $currentHolder->phone,
                    'email' => $currentHolder->email,
                    'placeholder' => $holderPlaceholder,
                ];
                $conflictsToFree[$jsonEmail] = $holderInfo;
            }

            $updates[] = [
                'db' => $user,
                'json' => $row,
                'targetEmail' => $jsonEmail,
                'holderInfo' => $holderInfo,
            ];
        }

        $this->newLine();
        $this->info('=== RINGKASAN ANALISIS EMAIL GURU ===');
        $this->info('Total Data di JSON: '.$totalJson);
        $this->info('1. Sudah Sesuai (Already Correct): '.count($alreadyCorrect));
        $this->info('2. Perlu Diupdate (Will Update): '.count($updates));
        $this->info('3. Belum Ada di DB (Not Yet Registered): '.count($notYetRegistered));
        $this->info('4. Email Tertukar / Perlu Dibebaskan: '.count($conflictsToFree));
        $this->newLine();

        if (! empty($conflictsToFree)) {
            $this->warn('DAFTAR EMAIL YANG AKAN DIBEBASKAN DARI USER YANG SALAH:');
            $this->table(
                ['Email', 'User Pemegang Saat Ini', 'No HP Pemegang', 'Akan Direset Ke'],
                array_map(fn ($email, $h) => [
                    $email,
                    "#{$h['id']} {$h['name']}",
                    $h['phone'] ?? '-',
                    $h['placeholder'],
                ], array_keys($conflictsToFree), array_values($conflictsToFree))
            );
        }

        if (! empty($updates)) {
            $this->info('DAFTAR EMAIL GURU YANG AKAN DISESUAIKAN KE EMAIL ASLI:');
            $this->table(
                ['Nama Guru', 'No HP', 'Cabang', 'Email di DB (Saat Ini)', 'Email Baru (Asli dari JSON)'],
                array_map(fn ($r) => [
                    $r['db']->name,
                    $r['json']['phone'] ?? $r['db']->phone,
                    $r['db']->branch ?? ($r['json']['kantor'] ?? '-'),
                    $r['db']->email,
                    $r['targetEmail'],
                ], $updates)
            );
        }

        if (! empty($notYetRegistered)) {
            $path = storage_path('app/private/notYetRegistered_'.now()->format('Y-m-d').'.json');
            @mkdir(dirname($path), 0755, true);
            file_put_contents($path, json_encode($notYetRegistered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $this->line("Daftar guru belum terdaftar di DB disimpan di: {$path} (".count($notYetRegistered).' orang)');
        }

        if ($isDryRun) {
            $this->newLine();
            $this->comment('Mode DRY-RUN aktif — tidak ada perubahan yang disimpan ke database.');
            $this->comment('Jalankan dengan opsi --execute untuk mengeksekusi perubahan email di database:');
            $this->info('  php artisan fix:guru-emails --execute');
            Log::info('fix:guru-emails dry-run', ['updates' => count($updates), 'conflicts' => count($conflictsToFree)]);

            return self::SUCCESS;
        }

        if (empty($updates) && empty($conflictsToFree)) {
            $this->info('Semua email guru sudah sesuai.');

            return self::SUCCESS;
        }

        if (! $this->confirm('Lanjutkan eksekusi perbaikan email guru di database?', true)) {
            $this->warn('Eksekusi dibatalkan.');

            return self::SUCCESS;
        }

        $freedCount = 0;
        $updatedCount = 0;

        DB::transaction(function () use ($conflictsToFree, $updates, &$freedCount, &$updatedCount) {
            // Step 1: Bebaskan email yang tertukar ke placeholder
            foreach ($conflictsToFree as $email => $h) {
                $holder = User::where('id', $h['id'])->lockForUpdate()->first();
                if ($holder && strcasecmp(trim((string) $holder->email), $email) === 0) {
                    $placeholder = $h['placeholder'];
                    // Ensure unique placeholder
                    $suffix = 1;
                    while (User::where('email', $placeholder)->where('id', '!=', $holder->id)->exists()) {
                        $placeholder = "guru{$holder->penyaluran_id}_{$suffix}@penyaluran.local";
                        $suffix++;
                    }
                    $holder->email = $placeholder;
                    $holder->teacher_profile_completed_at = null;
                    $holder->save();
                    $freedCount++;
                }
            }

            // Step 2: Update email asli ke guru yang berhak
            foreach ($updates as $r) {
                $user = User::where('id', $r['db']->id)->lockForUpdate()->first();
                if (! $user) {
                    continue;
                }
                $user->email = $r['targetEmail'];
                $user->email_verified_at = $user->email_verified_at ?: now();
                $user->teacher_profile_completed_at = now();
                $user->save();
                $updatedCount++;
            }
        });

        $this->newLine();
        $this->info("BERHASIL! {$freedCount} email tertukar telah dibebaskan dan {$updatedCount} email guru telah disesuaikan ke email aslinya.");
        Log::info('fix:guru-emails execute success', [
            'freed' => $freedCount,
            'updated' => $updatedCount,
        ]);

        return self::SUCCESS;
    }
}
