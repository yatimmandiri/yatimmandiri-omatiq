<?php

use App\Jobs\SyncParticipantToSheet;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Services\GoogleSheetService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('formats participant data correctly into 20 columns for Google Sheets', function () {
    $service = new GoogleSheetService;

    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
    ]);

    $student = Student::create([
        'nik' => '3525011505120099',
        'nis' => '12345',
        'full_name' => 'Ahmad Dahlan',
        'gender' => 'male',
        'school_name' => 'SD IT Al-Hikmah',
        'grade' => '5',
        'school_level' => 'SD',
        'parent_phone' => '081234567890',
        'is_binaan' => true,
    ]);

    $participant = Participant::create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-SYNC-001',
        'registration_type' => 'public',
        'status' => 'verified',
        'payment_status' => 'paid',
        'branch' => 'Surabaya',
        'event_year' => 2026,
    ]);

    $row = $service->rowFromParticipant($participant);

    expect(count($row))->toBe(20)
        ->and(count(GoogleSheetService::HEADERS))->toBe(20)
        ->and($row[1])->toBe('OMQ-SYNC-001') // Registrasi
        ->and($row[2])->toBe('3525011505120099') // NIK
        ->and($row[3])->toBe('12345') // NIS
        ->and($row[4])->toBe('Ahmad Dahlan') // Nama
        ->and($row[5])->toBe('male') // Gender
        ->and($row[6])->toBe('SD IT Al-Hikmah') // Sekolah
        ->and($row[7])->toBe('5') // Kelas
        ->and($row[8])->toBe('SD') // Jenjang
        ->and($row[10])->toBe('Surabaya') // Cabang
        ->and($row[11])->toBe(2026) // Tahun
        ->and($row[12])->toBe('Olimpiade Matematika') // Olimpiade
        ->and($row[13])->toBe('Matematika') // Kategori
        ->and($row[14])->toBe('public') // Jalur
        ->and($row[15])->toBe('verified') // Status
        ->and($row[16])->toBe('paid') // Pembayaran
        ->and($row[17])->toBe('081234567890'); // HP Wali
});

it('handles upsert job execution via GoogleSheetService', function () {
    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade IPA',
        'category' => 'IPA',
    ]);

    $student = Student::create([
        'nik' => '3525011505120088',
        'full_name' => 'Fatimah Az-Zahra',
        'gender' => 'female',
        'is_binaan' => false,
    ]);

    $participant = Participant::create([
        'student_id' => $student->id,
        'olimpiade_id' => $olimpiade->id,
        'registration_number' => 'OMQ-SYNC-002',
        'registration_type' => 'public',
        'status' => 'submitted',
    ]);

    $mockService = Mockery::mock(GoogleSheetService::class);
    $mockService->shouldReceive('upsert')
        ->once()
        ->with(Mockery::on(fn ($p) => $p->id === $participant->id));

    $job = new SyncParticipantToSheet($participant->id, 'upsert');
    $job->handle($mockService);
});

it('handles delete job execution with registration number even when participant is deleted from database', function () {
    $registrationNumber = 'OMQ-SYNC-DELETED-999';
    $snapshotRow = ['', $registrationNumber, '3525011505120077', '', 'Budi', 'male'];

    $mockService = Mockery::mock(GoogleSheetService::class);
    $mockService->shouldReceive('deleteByRegistrationNumber')
        ->once()
        ->with($registrationNumber, $snapshotRow);

    $job = new SyncParticipantToSheet(
        participantId: 9999,
        event: 'delete',
        registrationNumber: $registrationNumber,
        snapshotRow: $snapshotRow
    );

    $job->handle($mockService);
});
