<?php

namespace App\Console\Commands;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealSanggarAndIds extends Command
{
    protected $signature = 'omatiq:heal-binaan {--dry-run : Only simulate changes without modifying database}';

    protected $description = 'Selaraskan penyaluran_id di master students dan nama sanggar/mentor peserta binaan sesuai data resmi di API Penyaluran';

    public function handle(PenyaluranService $penyaluran): int
    {
        $isDryRun = (bool) $this->option('dry-run');

        $this->info('================================================================================');
        $this->info('🛠️  PENYELARASAN PENYALURAN ID & SANGGAR BINAAN OMATIQ');
        if ($isDryRun) {
            $this->warn('MODE: DRY-RUN (Simulasi saja, tidak mengubah database)');
        } else {
            $this->info('MODE: LIVE EXECUTION (Menerapkan perubahan ke database)');
        }
        $this->info('================================================================================');

        // 1. Ambil seluruh data santri dan guru dari API Penyaluran
        $teachers = User::role('Teacher')->whereNotNull('phone')->get(['id', 'name', 'phone', 'penyaluran_id', 'penyaluran_token']);
        $this->info("Mengumpulkan data santri resmi dari {$teachers->count()} guru di API Penyaluran...");

        $apiStudentsByNik = [];
        $apiStudentsById = [];
        $teacherByPhone = [];
        $teacherByPenyaluranId = [];

        foreach ($teachers as $t) {
            if ($t->phone) {
                $teacherByPhone[trim($t->phone)] = $t;
            }
            if ($t->penyaluran_id) {
                $teacherByPenyaluranId[(int) $t->penyaluran_id] = $t;
            }
        }

        $cachedData = Cache::get('penyaluran:all_students_index');
        if ($cachedData && is_array($cachedData)) {
            $apiStudentsById = $cachedData['byId'] ?? [];
            $apiStudentsByNik = $cachedData['byNik'] ?? [];
            $this->info('Menggunakan indeks cache API Penyaluran: '.count($apiStudentsById).' (ID), '.count($apiStudentsByNik).' (NIK)');
        } else {
            $bar = $this->output->createProgressBar($teachers->count());
            $bar->start();

            foreach ($teachers as $teacher) {
                session()->forget(['penyaluran_me', 'penyaluran_students', 'penyaluran_sanggars']);
                $token = $teacher->penyaluran_token;
                $students = [];

                if ($token) {
                    try {
                        $students = $penyaluran->students($token);
                    } catch (\Throwable $e) {
                        $students = [];
                    }
                }

                if (empty($students) && ! empty($teacher->phone)) {
                    try {
                        $freshToken = $penyaluran->loginGuru($teacher->phone);
                        if ($freshToken) {
                            $teacher->update(['penyaluran_token' => $freshToken]);
                            $students = $penyaluran->students($freshToken);
                        }
                    } catch (\Throwable $e) {
                        // ignore failed login
                    }
                }

                if (! empty($students)) {
                    foreach ($students as $s) {
                        $pId = $s['student_id'] ?? $s['id'] ?? null;
                        $nik = ! empty($s['nik']) ? trim((string) $s['nik']) : null;
                        $sanggarId = $s['sanggar_id'] ?? null;
                        $sanggarName = $s['sanggar_name'] ?? null;
                        $name = $s['name'] ?? $s['full_name'] ?? null;

                        $record = [
                            'penyaluran_id' => $pId ? (int) $pId : null,
                            'name' => $name,
                            'nik' => $nik,
                            'sanggar_id' => $sanggarId ? (int) $sanggarId : null,
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
                }

                $bar->advance();
            }

            $bar->finish();
            $this->line('');
            Cache::put('penyaluran:all_students_index', [
                'byId' => $apiStudentsById,
                'byNik' => $apiStudentsByNik,
            ], 1800);
        }

        $this->info('Total santri terindeks dari API Penyaluran: '.count($apiStudentsById).' (ID), '.count($apiStudentsByNik).' (NIK)');
        $this->line('');

        // 2. TAHAP 1: SELARASKAN PENYALURAN_ID PADA MASTER STUDENTS
        $this->info('================================================================================');
        $this->info('📌 TAHAP 1: Penyelarasan penyaluran_id pada tabel Students');
        $this->info('================================================================================');

        $studentsToUpdate = [];
        $studentsToClear = [];

        $allStudents = Student::all();

        foreach ($allStudents as $student) {
            $nik = trim((string) $student->nik);
            $currentPId = $student->penyaluran_id ? (int) $student->penyaluran_id : null;

            // Jika santri memiliki NIK dan terdaftar di API Penyaluran
            if ($nik && isset($apiStudentsByNik[$nik])) {
                $officialPId = $apiStudentsByNik[$nik]['penyaluran_id'];
                $officialSanggar = $apiStudentsByNik[$nik]['sanggar_name'];
                $officialMentorId = $apiStudentsByNik[$nik]['teacher_user_id'];
                $officialMentorName = $apiStudentsByNik[$nik]['teacher_name'];

                if ($officialPId && $currentPId !== $officialPId) {
                    $studentsToUpdate[] = [
                        'student' => $student,
                        'old_pid' => $currentPId,
                        'new_pid' => $officialPId,
                        'new_mentor_id' => $officialMentorId,
                        'new_mentor_name' => $officialMentorName,
                        'reason' => 'NIK ditemukan di Penyaluran API -> pasang ID resmi',
                    ];
                }
            } elseif ($currentPId && isset($apiStudentsById[$currentPId])) {
                // Santri memiliki penyaluran_id, tapi di API ID tersebut milik orang lain yang NIK-nya beda
                $ownerNik = trim((string) ($apiStudentsById[$currentPId]['nik'] ?? ''));
                if ($ownerNik && $ownerNik !== $nik) {
                    $studentsToClear[] = [
                        'student' => $student,
                        'old_pid' => $currentPId,
                        'new_pid' => null,
                        'reason' => "Penyaluran ID {$currentPId} sebenarnya milik {$apiStudentsById[$currentPId]['name']} ({$ownerNik})",
                    ];
                }
            }
        }

        $this->info('Santri yang akan diperbarui penyaluran_id ke ID resmi: '.count($studentsToUpdate));
        $this->info('Santri yang akan dibersihkan penyaluran_id karena milik orang lain: '.count($studentsToClear));

        if (! $isDryRun) {
            DB::transaction(function () use ($studentsToUpdate) {
                // Step 1: Kosongkan seluruh penyaluran_id pada tabel students (termasuk soft deleted)
                DB::table('students')->update(['penyaluran_id' => null]);

                // Step 2: Terapkan penyaluran_id yang resmi (pastikan unik per ID Penyaluran)
                $assignedPIds = [];
                foreach ($studentsToUpdate as $item) {
                    $pId = $item['new_pid'];
                    if (isset($assignedPIds[$pId])) {
                        // Jika ada duplikasi student dengan NIK sama, hanya update student ID pertama
                        continue;
                    }
                    $assignedPIds[$pId] = true;

                    DB::table('students')->where('id', $item['student']->id)->update([
                        'penyaluran_id' => $pId,
                        'is_binaan' => true,
                        'updated_at' => now(),
                    ]);
                }
            });
            $this->info('✅ Berhasil menyelaraskan penyaluran_id pada master students.');
        }

        // 3. TAHAP 2: SELARASKAN SANGGAR DAN GURU PADA PARTICIPANTS
        $this->line('');
        $this->info('================================================================================');
        $this->info('📌 TAHAP 2: Penyelarasan Sanggar & Guru pada tabel Participants');
        $this->info('================================================================================');

        $participants = Participant::with(['student', 'mentor'])->get();
        $participantsToUpdate = [];

        foreach ($participants as $p) {
            $student = $p->student;
            if (! $student) {
                continue;
            }

            $nik = trim((string) ($p->nik ?? $student->nik));
            if (! $nik || ! isset($apiStudentsByNik[$nik])) {
                continue;
            }

            $apiData = $apiStudentsByNik[$nik];
            $officialSanggarName = $apiData['sanggar_name'];
            $officialSanggarId = $apiData['sanggar_id'];
            $officialMentorId = $apiData['teacher_user_id'];
            $officialMentorName = $apiData['teacher_name'];

            $changes = [];

            // Cek perubahan sanggar
            if ($officialSanggarName && strcasecmp(trim((string) $p->penyaluran_sanggar_name), trim($officialSanggarName)) !== 0) {
                $changes['penyaluran_sanggar_name'] = $officialSanggarName;
                $changes['penyaluran_sanggar_id'] = $officialSanggarId;
            }

            // Cek perubahan mentor (jika participant mentor berbeda dengan pemilik resmi di Penyaluran)
            if ($officialMentorId && (int) $p->mentor_id !== (int) $officialMentorId) {
                $changes['mentor_id'] = $officialMentorId;
            }

            if (! empty($changes)) {
                $participantsToUpdate[] = [
                    'participant' => $p,
                    'changes' => $changes,
                    'reg_no' => $p->registration_number,
                    'name' => $student->full_name,
                    'nik' => $nik,
                    'old_sanggar' => $p->penyaluran_sanggar_name,
                    'new_sanggar' => $officialSanggarName,
                    'old_guru' => $p->mentor?->name ?? "ID {$p->mentor_id}",
                    'new_guru' => $officialMentorName,
                ];
            }
        }

        $this->info('Peserta binaan yang akan diselaraskan sanggar/mentornya: '.count($participantsToUpdate));

        if (count($participantsToUpdate) > 0) {
            $this->table(
                ['No Reg', 'Nama Santri', 'NIK', 'Sanggar Lama', 'Sanggar Baru (Resmi)', 'Guru Lama', 'Guru Baru (Resmi)'],
                collect($participantsToUpdate)->map(fn ($u) => [
                    $u['reg_no'],
                    $u['name'],
                    $u['nik'],
                    $u['old_sanggar'],
                    $u['new_sanggar'],
                    $u['old_guru'],
                    $u['new_guru'],
                ])->toArray()
            );

            if (! $isDryRun) {
                DB::transaction(function () use ($participantsToUpdate) {
                    foreach ($participantsToUpdate as $item) {
                        $item['participant']->update($item['changes']);

                        // Selaraskan juga mentor pada tabel students jika ada
                        if (isset($item['changes']['mentor_id'])) {
                            $item['participant']->student?->update([
                                'mentor_id' => $item['changes']['mentor_id'],
                                'mentor_name' => $item['new_guru'],
                            ]);
                        }
                    }
                });
                $this->info('✅ Berhasil menyelaraskan seluruh data sanggar dan mentor peserta binaan.');
            }
        } else {
            $this->info('✅ Seluruh data peserta binaan sudah selaras dengan API Penyaluran.');
        }

        $this->line('');
        $this->info('================================================================================');
        $this->info('🎉 PROSES PENYELARASAN SELESAI!');
        $this->info('================================================================================');

        return self::SUCCESS;
    }
}
