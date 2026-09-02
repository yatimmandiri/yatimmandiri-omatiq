<?php

namespace App\Console\Commands;

use App\Jobs\SyncParticipantToSheet;
use App\Models\Company\Participant;
use App\Services\GoogleSheetService;
use Illuminate\Console\Command;

class SyncParticipantsToSheet extends Command
{
    protected $signature = 'sheets:sync {--fresh : Clear sheet and re-sync all} {--chunk=200 : Chunk size}';

    protected $description = 'Sync Data Peserta to Google Sheets (realtime batch)';

    public function handle(GoogleSheetService $service): int
    {
        if (! $service->isEnabled() && ! $this->option('fresh')) {
            $this->warn('Sheets sync disabled. Enable via SiteSettings or .env GSHEETS_SYNC_ENABLED=true and set spreadsheet ID.');
            // still allow --fresh to test header
        }

        if ($this->option('fresh')) {
            $this->info('Ensuring header row...');
            $service->ensureHeaderRow();
            $this->info('Header ensured. Starting batch upsert...');
        }

        $chunk = (int) $this->option('chunk');
        $count = 0;

        Participant::with(['olimpiade:id,name,category', 'student:id,full_name,nik,nis,gender,school_name,grade,school_level,regency_id,parent_phone,mentor_name', 'student.regency:id,name', 'mentor:id,name'])
            ->chunkById($chunk, function ($participants) use (&$count) {
                foreach ($participants as $participant) {
                    SyncParticipantToSheet::dispatch($participant->id, 'upsert');
                    $count++;
                }
                $this->info("Queued {$count} participants...");
            });

        $this->info("Done. Queued {$count} jobs. Run queue:work to process.");

        return self::SUCCESS;
    }
}
