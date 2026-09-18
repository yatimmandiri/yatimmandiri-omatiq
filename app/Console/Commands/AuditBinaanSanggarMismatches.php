<?php

namespace App\Console\Commands;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Illuminate\Console\Command;

class AuditBinaanSanggarMismatches extends Command
{
    protected $signature = 'omatiq:audit-sanggar {--year=2026 : Filter event year} {--all : Check all teachers, not just active registrants}';

    protected $description = 'Audit ketidaksesuaian sanggar antara data pendaftaran Omatiq dan data resmi di API Penyaluran';

    public function handle(PenyaluranService $penyaluran): int
    {
        $year = (int) $this->option('year');
        $checkAll = (bool) $this->option('all');

        $this->info("================================================================================");
        $this->info("🔍 AUDIT KETIDAKSESUAIAN SANGGAR & PENYALURAN ID (Event Year: {$year})");
        $this->info("================================================================================");

        // Ambil guru yang relevan: semua guru yang memiliki peserta di Omatiq (atau semua jika --all)
        $teacherQuery = User::role('Teacher')->whereNotNull('phone');
        if (! $checkAll) {
            $mentorIds = Participant::whereNotNull('mentor_id')
                ->where(function ($q) use ($year) {
                    $q->where('event_year', $year)->orWhereNull('event_year');
                })
                ->distinct()
                ->pluck('mentor_id')
                ->toArray();

            $studentMentorIds = Student::where('is_binaan', true)
                ->whereNotNull('mentor_id')
                ->distinct()
                ->pluck('mentor_id')
                ->toArray();

            $relevantIds = array_unique(array_merge($mentorIds, $studentMentorIds));
            $teacherQuery->whereIn('id', $relevantIds);
        }

        $teachers = $teacherQuery->get(['id', 'name', 'phone', 'penyaluran_id', 'penyaluran_token']);
        $this->info("Mengumpulkan data santri dari {$teachers->count()} guru di API Penyaluran...");

        $apiStudentsByNik = [];
        $apiStudentsById = [];
        $teacherSuccess = 0;
        $teacherFail = 0;

        $bar = $this->output->createProgressBar($teachers->count());
        $bar->start();

        foreach ($teachers as $teacher) {
            session()->forget(['penyaluran_me', 'penyaluran_students', 'penyaluran_sanggars']);
            $token = $teacher->penyaluran_token;
            $students = [];

            // Coba dengan token yang ada
            if ($token) {
                try {
                    $students = $penyaluran->students($token);
                } catch (\Throwable $e) {
                    $students = [];
                }
            }

            // Jika token kadaluarsa atau kosong, coba login via phone
            if (empty($students) && ! empty($teacher->phone)) {
                try {
                    $freshToken = $penyaluran->loginGuru($teacher->phone);
                    if ($freshToken) {
                        $teacher->update(['penyaluran_token' => $freshToken]);
                        $students = $penyaluran->students($freshToken);
                    }
                } catch (\Throwable $e) {
                    // Guru gagal login Penyaluran
                }
            }

            if (! empty($students)) {
                $teacherSuccess++;
                foreach ($students as $s) {
                    $pId = $s['student_id'] ?? $s['id'] ?? null;
                    $nik = ! empty($s['nik']) ? trim((string) $s['nik']) : null;
                    $sanggarId = $s['sanggar_id'] ?? null;
                    $sanggarName = $s['sanggar_name'] ?? null;
                    $name = $s['name'] ?? $s['full_name'] ?? null;

                    $record = [
                        'penyaluran_id' => $pId,
                        'name' => $name,
                        'nik' => $nik,
                        'sanggar_id' => $sanggarId,
                        'sanggar_name' => $sanggarName,
                        'teacher_user_id' => $teacher->id,
                        'teacher_name' => $teacher->name,
                        'teacher_phone' => $teacher->phone,
                    ];

                    if ($pId) {
                        $apiStudentsById[(int) $pId] = $record;
                    }
                    if ($nik && strlen($nik) >= 10) {
                        $apiStudentsByNik[$nik] = $record;
                    }
                }
            } else {
                $teacherFail++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->line('');
        $this->info("Berhasil sinkronisasi dari {$teacherSuccess} guru (Gagal/Tidak ada murid: {$teacherFail}).");
        $this->info("Total santri terindeks dari API Penyaluran: ".count($apiStudentsById)." (berdasarkan ID), ".count($apiStudentsByNik)." (berdasarkan NIK)");
        $this->line('');

        // 2. Ambil semua peserta binaan terdaftar di Omatiq
        $participants = Participant::with(['student', 'mentor', 'olimpiade'])
            ->where(function ($q) use ($year) {
                $q->where('event_year', $year)->orWhereNull('event_year');
            })
            ->where(function ($q) {
                $q->where('registration_type', 'teacher')
                    ->orWhereNotNull('penyaluran_sanggar_name')
                    ->orWhereNotNull('mentor_id')
                    ->orWhereHas('student', fn ($sq) => $sq->where('is_binaan', true));
            })
            ->get();

        $this->info("Total peserta binaan di Omatiq ({$year}): {$participants->count()}");
        $this->line('');

        $sanggarMismatches = [];
        $penyaluranIdMismatches = [];

        foreach ($participants as $p) {
            $student = $p->student;
            if (! $student) {
                continue;
            }

            $nik = trim((string) ($p->nik ?? $student->nik));
            $pId = $student->penyaluran_id ? (int) $student->penyaluran_id : null;
            $sanggarDiOmatiq = $p->penyaluran_sanggar_name;
            $guruDiOmatiq = $p->mentor?->name ?? ($student->mentor_name ?? "User ID {$p->mentor_id}");

            // Cek data di API berdasarkan NIK (Prioritas 1)
            $apiDataByNik = ($nik && isset($apiStudentsByNik[$nik])) ? $apiStudentsByNik[$nik] : null;

            // Cek data di API berdasarkan Penyaluran ID
            $apiDataById = ($pId && isset($apiStudentsById[$pId])) ? $apiStudentsById[$pId] : null;

            // A. Cek ketidaksesuaian Sanggar
            if ($apiDataByNik) {
                $sanggarDiPenyaluran = $apiDataByNik['sanggar_name'];
                if ($sanggarDiOmatiq && $sanggarDiPenyaluran && strcasecmp(trim($sanggarDiOmatiq), trim($sanggarDiPenyaluran)) !== 0) {
                    $sanggarMismatches[] = [
                        'reg_number' => $p->registration_number,
                        'name' => $student->full_name,
                        'nik' => $nik,
                        'penyaluran_id' => $pId,
                        'guru_omatiq' => $guruDiOmatiq,
                        'sanggar_omatiq' => $sanggarDiOmatiq,
                        'guru_penyaluran' => $apiDataByNik['teacher_name'],
                        'sanggar_penyaluran' => $sanggarDiPenyaluran,
                    ];
                }
            }

            // B. Cek ketidaksesuaian Penyaluran ID (ID di database milik orang lain di API)
            if ($apiDataById && $nik) {
                $apiNik = $apiDataById['nik'] ?? null;
                if ($apiNik && $apiNik !== $nik) {
                    $penyaluranIdMismatches[] = [
                        'student_id' => $student->id,
                        'student_name' => $student->full_name,
                        'student_nik' => $nik,
                        'penyaluran_id' => $pId,
                        'penyaluran_owner_name' => $apiDataById['name'],
                        'penyaluran_owner_nik' => $apiNik,
                        'penyaluran_owner_sanggar' => $apiDataById['sanggar_name'],
                    ];
                }
            }
        }

        // 3. Tampilkan hasil
        $this->info('================================================================================');
        $this->info('📌 1. PESERTA DENGAN SANGGAR BERBEDA (OMATIQ vs PENYALURAN)');
        $this->info('================================================================================');

        if (count($sanggarMismatches) > 0) {
            $this->warn('Ditemukan '.count($sanggarMismatches).' peserta dengan nama sanggar berbeda:');
            $this->table(
                ['No Reg', 'Nama Santri', 'NIK', 'Sanggar di Omatiq', 'Sanggar di Penyaluran', 'Guru di Omatiq', 'Guru di Penyaluran'],
                collect($sanggarMismatches)->map(fn ($m) => [
                    $m['reg_number'],
                    $m['name'],
                    $m['nik'],
                    $m['sanggar_omatiq'],
                    $m['sanggar_penyaluran'],
                    $m['guru_omatiq'],
                    $m['guru_penyaluran'],
                ])->toArray()
            );
        } else {
            $this->info('✅ TIDAK DITEMUKAN peserta binaan yang sanggarnya berbeda dengan API Penyaluran!');
        }

        $this->line('');
        $this->info('================================================================================');
        $this->info('📌 2. SANTRI DENGAN PENYALURAN ID TERTUKAR / SALAH PEMILIK');
        $this->info('================================================================================');

        if (count($penyaluranIdMismatches) > 0) {
            $this->error('⚠️ Ditemukan '.count($penyaluranIdMismatches).' data santri dengan Penyaluran ID tertukar:');
            $this->table(
                ['Student ID', 'Nama di DB Omatiq', 'NIK di DB', 'Penyaluran ID', 'Pemilik Asli di API', 'NIK Pemilik Asli', 'Sanggar Pemilik Asli'],
                collect($penyaluranIdMismatches)->map(fn ($m) => [
                    $m['student_id'],
                    $m['student_name'],
                    $m['student_nik'],
                    $m['penyaluran_id'],
                    $m['penyaluran_owner_name'],
                    $m['penyaluran_owner_nik'],
                    $m['penyaluran_owner_sanggar'],
                ])->toArray()
            );
        } else {
            $this->info('✅ TIDAK DITEMUKAN santri dengan penyaluran_id yang tertukar!');
        }

        // 4. Audit juga seluruh tabel students (bukan hanya participants) untuk cek penyaluran_id mismatch
        $this->line('');
        $this->info('================================================================================');
        $this->info('📌 3. AUDIT SELURUH MASTER STUDENTS (PENYALURAN_ID MISMATCH)');
        $this->info('================================================================================');

        $allStudents = Student::whereNotNull('penyaluran_id')->get();
        $allStudentIdMismatches = [];

        foreach ($allStudents as $student) {
            $pId = (int) $student->penyaluran_id;
            $nik = trim((string) $student->nik);

            if (isset($apiStudentsById[$pId])) {
                $apiData = $apiStudentsById[$pId];
                $apiNik = trim((string) ($apiData['nik'] ?? ''));

                if ($nik && $apiNik && $nik !== $apiNik) {
                    $allStudentIdMismatches[] = [
                        'id' => $student->id,
                        'name' => $student->full_name,
                        'nik' => $nik,
                        'pId' => $pId,
                        'api_name' => $apiData['name'],
                        'api_nik' => $apiNik,
                        'api_sanggar' => $apiData['sanggar_name'],
                    ];
                }
            }
        }

        if (count($allStudentIdMismatches) > 0) {
            $this->error('⚠️ Ditemukan '.count($allStudentIdMismatches).' master student dengan Penyaluran ID tertukar:');
            $this->table(
                ['ID', 'Nama di Omatiq', 'NIK di Omatiq', 'Penyaluran ID', 'Pemilik Asli di API', 'NIK Asli', 'Sanggar Asli'],
                collect($allStudentIdMismatches)->map(fn ($m) => [
                    $m['id'],
                    $m['name'],
                    $m['nik'],
                    $m['pId'],
                    $m['api_name'],
                    $m['api_nik'],
                    $m['api_sanggar'],
                ])->toArray()
            );
        } else {
            $this->info('✅ Seluruh master students yang memiliki penyaluran_id telah cocok dengan pemilik aslinya di API Penyaluran.');
        }

        $this->line('');

        return self::SUCCESS;
    }
}
