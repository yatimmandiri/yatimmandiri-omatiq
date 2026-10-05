<?php

namespace App\Console\Commands;

use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use App\Services\StudentService;
use Illuminate\Console\Command;

class HealPenyaluranStudentsCommand extends Command
{
    protected $signature = 'omatiq:heal-penyaluran-students
                            {--id= : Perbaiki dan sinkronkan santri tertentu berdasarkan ID lokal atau Penyaluran ID}
                            {--nik= : Perbaiki dan sinkronkan santri tertentu berdasarkan NIK}
                            {--limit=0 : Batasi jumlah santri binaan yang diproses (0 = semua)}
                            {--dry-run : Uji coba pengecekan tanpa melakukan update data}';

    protected $description = 'Periksa, pulihkan keterhubungan (Penyaluran ID, NIK, Mentor), dan sinkronkan data santri binaan yang terkendala update ke API Penyaluran';

    public function handle(PenyaluranService $penyaluran, StudentService $studentService): int
    {
        $specificId = $this->option('id');
        $specificNik = $this->option('nik');
        $limit = (int) $this->option('limit');
        $isDryRun = (bool) $this->option('dry-run');

        $this->info('=== OMATIQ: Heal & Sync Students to Penyaluran API ===');
        if ($isDryRun) {
            $this->warn('[DRY-RUN MODE] Tidak ada perubahan data lokal maupun API yang dieksekusi.');
        }

        // 1. Dapatkan Bearer token yang valid untuk komunikasi API Penyaluran
        $this->info('1. Memeriksa validitas Bearer token Penyaluran API...');
        $token = $studentService->resolveToken(forceFresh: true);

        if (! $token) {
            $this->error('Gagal mendapatkan Bearer token Penyaluran. Pastikan terdapat akun Guru yang terdaftar dengan nomor HP aktif di sistem.');

            return self::FAILURE;
        }

        $this->info('Token Penyaluran API berhasil diperoleh.');

        // 2. Ambil master data santri binaan dari API Penyaluran
        $this->info('2. Mengambil master data santri dari Penyaluran API (api/v1/students)...');
        try {
            $apiStudents = $penyaluran->allStudents();
        } catch (\Throwable $e) {
            $this->error('Gagal mengambil data dari Penyaluran: '.$e->getMessage());

            return self::FAILURE;
        }

        $totalApi = count($apiStudents);
        $this->info("Berhasil memuat {$totalApi} data santri dari API Penyaluran.");

        $apiStudentsByPenyaluranId = collect($apiStudents)->keyBy(fn ($s) => (int) ($s['id'] ?? $s['student_id'] ?? 0));
        $apiStudentsByNik = collect($apiStudents)
            ->filter(fn ($s) => ! empty($s['nik']) && strlen(trim($s['nik'])) >= 10 && $s['nik'] !== '-' && $s['nik'] !== '0')
            ->keyBy(fn ($s) => trim($s['nik']));

        // Cache daftar guru untuk pencocokan mentor
        $teachersByPhone = User::whereHas('roles', fn ($q) => $q->where('name', 'Teacher'))
            ->whereNotNull('phone')
            ->get()
            ->keyBy('phone');

        // 3. Filter data santri lokal yang akan diperiksa
        $query = Student::query();

        if ($specificId) {
            $query->where(function ($q) use ($specificId) {
                $q->where('id', $specificId)->orWhere('penyaluran_id', $specificId);
            });
        } elseif ($specificNik) {
            $query->where('nik', trim($specificNik));
        } else {
            $query->where(function ($q) {
                $q->where('is_binaan', true)
                    ->orWhereNotNull('penyaluran_id');
            });
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        $students = $query->get();
        $this->info("3. Memeriksa {$students->count()} data santri pada database lokal...");

        $fixedCount = 0;
        $syncedCount = 0;
        $failedCount = 0;
        $unlinkedCount = 0;

        $progressBar = $this->output->createProgressBar($students->count());
        $progressBar->start();

        foreach ($students as $student) {
            $needsSave = false;
            $penyaluranData = null;

            // A. Cari kecocokan data dari API Penyaluran
            if ($student->penyaluran_id && $apiStudentsByPenyaluranId->has((int) $student->penyaluran_id)) {
                $penyaluranData = $apiStudentsByPenyaluranId->get((int) $student->penyaluran_id);
            } elseif ($student->nik && $apiStudentsByNik->has(trim($student->nik))) {
                $penyaluranData = $apiStudentsByNik->get(trim($student->nik));
            } elseif ($student->penyaluran_id) {
                // Single fetch fallback jika tidak ada di bulk list
                try {
                    $penyaluranData = $penyaluran->student($student->penyaluran_id);
                } catch (\Throwable $e) {
                    $penyaluranData = null;
                }
            }

            if (! $penyaluranData) {
                $unlinkedCount++;
                $progressBar->advance();

                continue;
            }

            $apiId = (int) ($penyaluranData['id'] ?? $penyaluranData['student_id'] ?? 0);
            $apiNik = ! empty($penyaluranData['nik']) && strlen(trim($penyaluranData['nik'])) >= 10 && $penyaluranData['nik'] !== '-' && $penyaluranData['nik'] !== '0'
                ? trim($penyaluranData['nik'])
                : null;

            // B. Pulihkan Penyaluran ID jika belum ada atau tidak sinkron
            if ($apiId > 0 && (int) $student->penyaluran_id !== $apiId) {
                // Pastikan tidak ada duplikasi penyaluran_id di record lain
                if (! $isDryRun) {
                    Student::withTrashed()
                        ->where('penyaluran_id', $apiId)
                        ->where('id', '!=', $student->id)
                        ->update(['penyaluran_id' => null]);
                }
                $student->penyaluran_id = $apiId;
                $student->is_binaan = true;
                $needsSave = true;
            }

            // C. Pulihkan NIK jika lokal kosong / placeholder dan API memiliki NIK valid
            if ($apiNik && (empty($student->nik) || strlen($student->nik) < 10 || $student->nik === '-' || $student->nik === '0')) {
                $student->nik = $apiNik;
                $needsSave = true;
            }

            // D. Lengkapi mentor_id / mentor_phone jika kosong
            $teacherPhone = $penyaluranData['teacher_phone'] ?? null;
            if ($teacherPhone && empty($student->mentor_phone)) {
                $student->mentor_phone = $teacherPhone;
                $needsSave = true;
            }
            if ($teacherPhone && empty($student->mentor_id) && $teachersByPhone->has($teacherPhone)) {
                $teacherUser = $teachersByPhone->get($teacherPhone);
                $student->mentor_id = $teacherUser->id;
                $student->mentor_name = $teacherUser->name;
                $needsSave = true;
            }

            // Simpan perbaikan relasi lokal
            if ($needsSave) {
                $fixedCount++;
                if (! $isDryRun) {
                    $student->save();
                }
            }

            // E. Uji dan selaraskan sinkronisasi update ke API Penyaluran (Two-Way Sync verification)
            try {
                if (! $isDryRun && $student->penyaluran_id) {
                    // Update field minimal yang aman untuk memverifikasi jalur PUT api/v1/guru/students/{id}
                    $payload = [
                        'status' => (bool) $student->is_active,
                        'name' => $student->full_name,
                    ];
                    $syncSuccess = $studentService->syncToPenyaluran($student, $payload, $token, throwOnFailure: false);
                    if ($syncSuccess) {
                        $syncedCount++;
                    } else {
                        $failedCount++;
                    }
                }
            } catch (\Throwable $e) {
                $failedCount++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // 4. Summary Output
        $this->table(
            ['Indikator', 'Jumlah'],
            [
                ['Total Santri Diperiksa', $students->count()],
                ['Data Santri Diperbaiki (Penyaluran ID/NIK/Mentor)', $fixedCount],
                ['Berhasil Sinkron ke API Penyaluran', $isDryRun ? '(Dilewati pada mode dry-run)' : $syncedCount],
                ['Gagal Sinkron ke API Penyaluran', $isDryRun ? 0 : $failedCount],
                ['Tidak Ditemukan di API Penyaluran', $unlinkedCount],
            ]
        );

        if ($failedCount > 0) {
            $this->warn("Terdapat {$failedCount} data yang gagal sinkron ke Penyaluran. Pastikan akun pembina memiliki akses ke data santri tersebut.");
        } else {
            $this->info('Semua data santri yang diperiksa telah siap dan terhubung ke API Penyaluran.');
        }

        return self::SUCCESS;
    }
}
