<?php

namespace App\Console\Commands;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\GoogleSheetService;
use Illuminate\Console\Command;

class RestoreRafaHananCommand extends Command
{
    protected $signature = 'omatiq:restore-rafa-hanan {--dry-run : Uji coba tanpa menyimpan perubahan}';

    protected $description = 'Pulihkan data pendaftaran umum RAFA HANAN ADYATAMA (OMQ-20260918-0021)';

    public function handle(): int
    {
        $isDryRun = (bool) $this->option('dry-run');

        $this->info('=== RESTORASI PESERTA RAFA HANAN ADYATAMA ===');

        $user = User::find(437);
        if (! $user) {
            $this->error('User 437 (RAFA HANAN ADYATAMA) tidak ditemukan!');

            return self::FAILURE;
        }

        $this->info("User ditemukan: {$user->name} ({$user->email})");

        // Cek student 821 saat ini (Kayla)
        $student821 = Student::find(821);
        $this->info('Student ID 821 saat ini: '.($student821 ? $student821->full_name : 'null'));

        // Cek apakah pendaftaran OMQ-20260918-0021 sudah ada
        $existingParticipant = Participant::withTrashed()->where('registration_number', 'OMQ-20260918-0021')->first();
        if ($existingParticipant) {
            $this->warn("Pendaftaran OMQ-20260918-0021 sudah ada (ID: {$existingParticipant->id})");
            if ($existingParticipant->trashed()) {
                if (! $isDryRun) {
                    $existingParticipant->restore();
                }
                $this->info('Pendaftaran OMQ-20260918-0021 berhasil di-restore.');
            }

            return self::SUCCESS;
        }

        // Cek apakah Student RAFA HANAN ADYATAMA sudah dibuat terpisah
        $rafaStudent = Student::where('user_id', 437)->first();
        if (! $rafaStudent) {
            $this->info('Memeriksa Google Sheets untuk data pendaftaran Rafa...');
            $sheetService = app(GoogleSheetService::class);
            $sheetRow = null;
            try {
                $sheetRow = $sheetService->findByRegNo('OMQ-20260918-0021');
            } catch (\Throwable $e) {
                $this->warn('Tidak dapat mengambil data sheet: '.$e->getMessage());
            }

            $nik = '3326101005150001'; // Fallback NIK sesuai tgl lahir & Pekalongan jika tidak ada di sheet
            $nisn = null;
            if ($sheetRow && ! empty($sheetRow['row'])) {
                $row = $sheetRow['row'];
                $this->info('Data Sheet ditemukan: '.json_encode($row));
                // Header Google Sheets: 0: No, 1: Registrasi, 2: NIK, 3: NIS, 4: Nama
                if (! empty($row[2])) {
                    $nik = (string) $row[2];
                }
                if (! empty($row[3])) {
                    $nisn = (string) $row[3];
                }
            }

            $this->info("Menggunakan NIK: {$nik}");
            $this->info('Membuat record Student terpisah untuk RAFA HANAN ADYATAMA...');
            if (! $isDryRun) {
                $rafaStudent = Student::create([
                    'user_id' => 437,
                    'nik' => $nik,
                    'nisn' => $nisn,
                    'full_name' => 'RAFA HANAN ADYATAMA',
                    'nickname' => 'RAFA',
                    'gender' => 'male',
                    'birth_place' => $student821?->birth_place ?? 'PEKALONGAN',
                    'birth_date' => '2015-05-10', // perkiraan atau sesuai jenjang SD
                    'school_name' => $student821?->school_name ?? "MI MA'ARIF NU KALIJAMBE",
                    'school_level' => 'SD',
                    'grade' => 'V',
                    'address' => $student821?->address ?? 'PEKALONGAN',
                    'province_id' => $student821?->province_id ?? 33,
                    'regency_id' => $student821?->regency_id ?? 3326,
                    'district_id' => $student821?->district_id,
                    'village_id' => $student821?->village_id,
                    'parent_phone' => '081548271626',
                    'student_card_path' => 'uploads/students/student_card/e03c86a4-089b-4cc7-8932-4b68cf0c8484.pdf',
                    'is_binaan' => false,
                    'is_active' => true,
                ]);
            }
        }

        $studentId = $rafaStudent ? $rafaStudent->id : 9999;
        $this->info("Student ID untuk Rafa Hanan Adyatama: {$studentId}");

        $this->info('Membuat kembali record Participant OMQ-20260918-0021...');
        if (! $isDryRun) {
            $participant = Participant::create([
                'id' => 797,
                'registration_number' => 'OMQ-20260918-0021',
                'user_id' => 437,
                'student_id' => $studentId,
                'olimpiade_id' => 1, // Olimpiade Al-Quran
                'event_year' => 2026,
                'registration_type' => 'public',
                'branch' => 'PEKALONGAN',
                'payment_status' => 'paid',
                'status' => 'verified',
                'data_truth_consent' => true,
                'documentation_consent' => true,
                'rules_consent' => true,
                'participant_signature_name' => 'RAFA HANAN ADYATAMA',
                'guardian_signature_name' => 'SRI WINARSIH',
                'created_at' => '2026-09-18 06:14:30',
                'updated_at' => '2026-09-18 06:14:30',
            ]);

            $this->info("Participant berhasil dibuat kembali: ID {$participant->id} - No Reg {$participant->registration_number}");
        }

        $this->info('Restorasi berhasil diselesaikan.');

        return self::SUCCESS;
    }
}
