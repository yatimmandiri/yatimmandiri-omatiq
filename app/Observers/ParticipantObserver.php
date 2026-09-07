<?php

namespace App\Observers;

use App\Jobs\SyncParticipantToSheet;
use App\Models\Company\Participant;
use App\Services\GoogleSheetService;
use App\Settings\SiteSettings;
use Illuminate\Support\Facades\Log;

class ParticipantObserver
{
    public function created(Participant $participant): void
    {
        $this->dispatch($participant, 'upsert');
    }

    public function updated(Participant $participant): void
    {
        $this->dispatch($participant, 'upsert');
    }

    public function deleted(Participant $participant): void
    {
        $row = null;
        try {
            $row = app(GoogleSheetService::class)->rowFromParticipant($participant);
        } catch (\Throwable $e) {
            $row = null;
        }

        $this->dispatch($participant, 'delete', $participant->registration_number, $row);
    }

    private function dispatch(Participant $participant, string $event, ?string $regNo = null, ?array $snapshotRow = null): void
    {
        if (app()->runningInConsole() && ! app()->environment('testing')) {
            // Skip during migrate:fresh --seed in console to avoid spam, unless explicitly enabled
            try {
                if (! app(SiteSettings::class)->sheets_sync_enabled) {
                    return;
                }
            } catch (\Throwable $e) {
                return;
            }
        }

        if (app()->environment('testing')) {
            return;
        }

        try {
            SyncParticipantToSheet::dispatch(
                $participant->id,
                $event,
                $regNo ?? $participant->registration_number,
                $snapshotRow,
            )->afterCommit();
        } catch (\Throwable $e) {
            Log::warning('sheets observer dispatch failed', ['id' => $participant->id, 'error' => $e->getMessage()]);
        }
    }
}
