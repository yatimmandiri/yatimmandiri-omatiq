<?php

namespace App\Services;

use App\Models\Company\Participant;
use App\Settings\SiteSettings;
use Google\Client;
use Google\Service\Sheets;
use Google\Service\Sheets\BatchUpdateValuesRequest;
use Google\Service\Sheets\ValueRange;
use Illuminate\Support\Facades\Log;

class GoogleSheetService
{
    public const HEADERS = [
        'No',
        'Registrasi',
        'NIK',
        'NIS',
        'Nama',
        'Gender',
        'Sekolah',
        'Kelas',
        'Jenjang',
        'Wilayah',
        'Cabang',
        'Tahun',
        'Olimpiade',
        'Kategori',
        'Jalur',
        'Status',
        'Pembayaran',
        'HP Wali',
        'Mentor',
        'Tgl Daftar',
    ];

    private function client(): ?Client
    {
        $credentials = config('sheets.credentials');
        if (! $credentials || ! file_exists($credentials)) {
            Log::warning('sheets.credentials not found', ['path' => $credentials]);

            return null;
        }

        $client = new Client;
        $client->setAuthConfig($credentials);
        $client->addScope(Sheets::SPREADSHEETS);
        $client->setApplicationName('OMATIQ Sheets Sync');

        return $client;
    }

    private function service(): ?Sheets
    {
        $client = $this->client();
        if (! $client) {
            return null;
        }

        return new Sheets($client);
    }

    private function spreadsheetId(): ?string
    {
        $id = config('sheets.spreadsheet_id') ?? app(SiteSettings::class)->sheets_spreadsheet_id ?? null;

        return $id ?: null;
    }

    private function sheetName(): string
    {
        return config('sheets.sheet_name', 'Data Peserta');
    }

    public function isEnabled(): bool
    {
        if (app()->environment('testing')) {
            return false;
        }

        $enabled = config('sheets.enabled');
        if ($enabled === null) {
            try {
                $enabled = app(SiteSettings::class)->sheets_sync_enabled;
            } catch (\Throwable $e) {
                $enabled = false;
            }
        }

        return (bool) $enabled && (bool) $this->spreadsheetId();
    }

    public function ensureHeaderRow(): void
    {
        $service = $this->service();
        $spreadsheetId = $this->spreadsheetId();
        if (! $service || ! $spreadsheetId) {
            return;
        }

        $sheet = $this->sheetName();
        try {
            $response = $service->spreadsheets_values->get($spreadsheetId, "{$sheet}!A1:T1");
            $values = $response->getValues();
            if (! empty($values[0])) {
                return;
            }
        } catch (\Throwable $e) {
            // sheet may not exist or empty
        }

        try {
            $body = new ValueRange(['values' => [self::HEADERS]]);
            $service->spreadsheets_values->update(
                $spreadsheetId,
                "{$sheet}!A1",
                $body,
                ['valueInputOption' => 'RAW']
            );
        } catch (\Throwable $e) {
            Log::warning('sheets.ensureHeader failed', ['error' => $e->getMessage()]);
        }
    }

    public function rowFromParticipant(Participant $participant): array
    {
        $participant->loadMissing(['olimpiade:id,name,category', 'student:id,full_name,nik,nis,gender,school_name,grade,school_level,regency_id', 'student.regency:id,name', 'mentor:id,name']);

        $student = $participant->student;

        return [
            '', // No - filled by sheet formula or sequential
            $participant->registration_number ?? '',
            $student?->nik ?? $participant->nik ?? '',
            $student?->nis ?? '',
            $student?->full_name ?? $participant->nik ?? '-',
            $student?->gender ?? '',
            $student?->school_name ?? '',
            $student?->grade ?? '',
            $student?->school_level ?? '',
            $student?->regency?->name ?? $participant->penyaluran_sanggar_name ?? '',
            $participant->branch ?? '',
            $participant->event_year ?? '',
            $participant->olimpiade?->name ?? '',
            $participant->olimpiade?->category ?? '',
            $participant->registration_type ?? '',
            $participant->status ?? '',
            $participant->payment_status ?? '',
            $student?->parent_phone ?? '',
            $participant->mentor?->name ?? $student?->mentor_name ?? '',
            $participant->created_at?->format('Y-m-d H:i') ?? '',
        ];
    }

    public function upsert(Participant $participant): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        $service = $this->service();
        $spreadsheetId = $this->spreadsheetId();
        if (! $service || ! $spreadsheetId) {
            return;
        }

        $this->ensureHeaderRow();

        $row = $this->rowFromParticipant($participant);
        $sheet = $this->sheetName();

        try {
            // Find existing row by Registrasi column B
            $response = $service->spreadsheets_values->get($spreadsheetId, "{$sheet}!B2:B");
            $values = $response->getValues() ?? [];
            $rowIndex = null;
            foreach ($values as $idx => $v) {
                if (($v[0] ?? '') === $participant->registration_number) {
                    $rowIndex = $idx + 2; // 1-based + header
                    break;
                }
            }

            // Fill No
            $row[0] = $rowIndex ?? (count($values) + 2);

            $body = new ValueRange(['values' => [$row]]);
            if ($rowIndex) {
                $service->spreadsheets_values->update(
                    $spreadsheetId,
                    "{$sheet}!A{$rowIndex}",
                    $body,
                    ['valueInputOption' => 'USER_ENTERED']
                );
            } else {
                $service->spreadsheets_values->append(
                    $spreadsheetId,
                    "{$sheet}!A2",
                    $body,
                    ['valueInputOption' => 'USER_ENTERED', 'insertDataOption' => 'INSERT_ROWS']
                );
            }
        } catch (\Throwable $e) {
            Log::warning('sheets.upsert failed', ['reg' => $participant->registration_number, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function delete(Participant $participant): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        // Soft delete: set Status to Dihapus instead of removing row for audit
        $participant->status = 'deleted';
        $this->upsert($participant);
    }

    public function batchUpsert(iterable $participants): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        $service = $this->service();
        $spreadsheetId = $this->spreadsheetId();
        if (! $service || ! $spreadsheetId) {
            return;
        }

        $this->ensureHeaderRow();

        $sheet = $this->sheetName();

        // Fetch existing Registrasi column once for batch
        $existingMap = [];
        $existingCount = 0;
        try {
            $response = $service->spreadsheets_values->get($spreadsheetId, "{$sheet}!B2:B");
            $values = $response->getValues() ?? [];
            $existingCount = count($values);
            foreach ($values as $idx => $v) {
                $reg = $v[0] ?? '';
                if ($reg !== '') {
                    $existingMap[$reg] = $idx + 2;
                }
            }
        } catch (\Throwable $e) {
            $existingCount = 0;
        }

        $updates = [];
        $appends = [];

        foreach ($participants as $participant) {
            try {
                $row = $this->rowFromParticipant($participant);
                $regNo = $participant->registration_number;
                if (isset($existingMap[$regNo])) {
                    $rowIndex = $existingMap[$regNo];
                    $row[0] = $rowIndex;
                    $updates[] = new ValueRange([
                        'range' => "{$sheet}!A{$rowIndex}:T{$rowIndex}",
                        'values' => [$row],
                    ]);
                } else {
                    $row[0] = $existingCount + count($appends) + 2;
                    $appends[] = $row;
                }
            } catch (\Throwable $e) {
                Log::warning('sheets.batchUpsert row failed', ['id' => $participant->id ?? 'unknown', 'error' => $e->getMessage()]);
            }
        }

        try {
            if (! empty($updates)) {
                $service->spreadsheets_values->batchUpdate(
                    $spreadsheetId,
                    new BatchUpdateValuesRequest([
                        'valueInputOption' => 'USER_ENTERED',
                        'data' => $updates,
                    ])
                );
            }
            if (! empty($appends)) {
                $body = new ValueRange(['values' => $appends]);
                $service->spreadsheets_values->append(
                    $spreadsheetId,
                    "{$sheet}!A2",
                    $body,
                    ['valueInputOption' => 'USER_ENTERED', 'insertDataOption' => 'INSERT_ROWS']
                );
            }
        } catch (\Throwable $e) {
            Log::warning('sheets.batchUpsert failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
