<?php

namespace App\Jobs;

use App\Models\Company\Participant;
use App\Services\GoogleSheetService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;

class SyncParticipantToSheet implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function middleware(): array
    {
        return [new RateLimited('sheets')];
    }

    public function __construct(
        public int $participantId,
        public string $event = 'upsert',
        public ?string $registrationNumber = null,
        public ?array $snapshotRow = null,
    ) {}

    public function handle(GoogleSheetService $service): void
    {
        if ($this->event === 'delete') {
            $regNo = $this->registrationNumber;
            if (! $regNo) {
                $participant = Participant::find($this->participantId);
                $regNo = $participant?->registration_number;
            }

            if ($regNo) {
                $service->deleteByRegistrationNumber($regNo, $this->snapshotRow);
            }

            return;
        }

        $participant = Participant::with(['olimpiade:id,name,category', 'student:id,full_name,nik,nis,gender,school_name,grade,school_level,regency_id,parent_phone,mentor_name', 'student.regency:id,name', 'mentor:id,name'])->find($this->participantId);

        if (! $participant) {
            return;
        }

        $service->upsert($participant);
    }
}
