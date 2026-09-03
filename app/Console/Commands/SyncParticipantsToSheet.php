<?php

namespace App\Console\Commands;

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
            ->chunkById($chunk, function ($participants) use ($service, &$count) {
                $service->batchUpsert($participants);
                $count += $participants->count();
                $this->info("Synced {$count} participants (batch)...");
            });

        $this->info("Done. Synced {$count} participants directly (batch).");

        return self::SUCCESS;
    }
}
