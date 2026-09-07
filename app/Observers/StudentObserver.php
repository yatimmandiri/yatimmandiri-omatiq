<?php

namespace App\Observers;

use App\Jobs\SyncParticipantToSheet;
use App\Models\Company\Student;
use App\Settings\SiteSettings;
use Illuminate\Support\Facades\Log;

class StudentObserver
{
    /**
     * Handle the Student "updated" event.
     */
    public function updated(Student $student): void
    {
        if (app()->runningInConsole() && ! app()->environment('testing')) {
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
            $student->loadMissing('participants:id,student_id');

            foreach ($student->participants as $participant) {
                SyncParticipantToSheet::dispatch(
                    $participant->id,
                    'upsert',
                )->afterCommit();
            }
        } catch (\Throwable $e) {
            Log::warning('student sheets observer dispatch failed', ['student_id' => $student->id, 'error' => $e->getMessage()]);
        }
    }
}
