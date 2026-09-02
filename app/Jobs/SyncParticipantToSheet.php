<?php

namespace App\Jobs;

use App\Models\Company\Participant;
use App\Services\GoogleSheetService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncParticipantToSheet implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [30, 60];

    public function __construct(
        public int $participantId,
        public string $event = 'upsert',
    ) {}

    public function handle(GoogleSheetService $service): void
    {
        $participant = Participant::with(['olimpiade:id,name,category', 'student:id,full_name,nik,nis,gender,school_name,grade,school_level,regency_id,parent_phone,mentor_name', 'student.regency:id,name', 'mentor:id,name'])->find($this->participantId);

        if (! $participant) {
            return;
        }

        if ($this->event === 'delete') {
            $service->delete($participant);
        } else {
            $service->upsert($participant);
        }
    }
}
