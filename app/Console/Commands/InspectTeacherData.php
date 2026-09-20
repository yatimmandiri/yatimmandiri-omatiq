<?php

namespace App\Console\Commands;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Illuminate\Console\Command;

class InspectTeacherData extends Command
{
    protected $signature = 'omatiq:inspect {--teacher= : Email or Phone or Name of Teacher} {--nik= : NIK of student} {--name= : Name of student} {--range= : ID range e.g. 30-45} {--audit-no-nik : Audit peserta yang di API Penyaluran belum punya NIK} {--audit-cross-teacher : Audit santri yang terdaftar di guru/sanggar lain}';

    protected $description = 'Periksa data detail guru, binaan, dan peserta di database';

    public function handle(PenyaluranService $penyaluran): int
    {
        $teacherQuery = $this->option('teacher');
        $nik = $this->option('nik');
        $name = $this->option('name');
        $range = $this->option('range');
        $auditNoNik = (bool) $this->option('audit-no-nik');
        $auditCrossTeacher = (bool) $this->option('audit-cross-teacher');

        if ($auditCrossTeacher) {
            $this->info('================================================================================');
            $this->info('🔍 AUDIT LINTAS GURU & SANGGAR (SANTRI TERDAFTAR DI GURU/SANGGAR BUKAN ASLINYA)');
            $this->info('================================================================================');

            $participants = Participant::with(['student', 'mentor', 'olimpiade:id,name'])
                ->where(fn ($q) => $q->where('event_year', 2026)->orWhereNull('event_year'))
                ->whereIn('status', ['submitted', 'verified'])
                ->where('registration_type', 'teacher')
                ->get();

            $teachers = User::role('Teacher')->whereNotNull('phone')->get(['id', 'name', 'phone', 'penyaluran_id', 'penyaluran_token']);
            $this->info("Mengumpulkan data santri resmi dari {$teachers->count()} akun Guru di API Penyaluran...");

            $apiStudentsById = [];
            $apiStudentsByNik = [];
            $apiStudentsByName = [];
            $bar = $this->output->createProgressBar($teachers->count());
            $bar->start();

            foreach ($teachers as $teacher) {
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
                    }
                }

                foreach ($students as $s) {
                    $pId = (int) ($s['student_id'] ?? $s['id'] ?? 0);
                    $sNik = trim((string) ($s['nik'] ?? ''));
                    $sName = strtolower(trim((string) ($s['name'] ?? $s['full_name'] ?? '')));
                    $sanggarName = trim((string) ($s['sanggar_name'] ?? ''));

                    $entry = [
                        'student_id' => $pId,
                        'name' => $s['name'] ?? $s['full_name'] ?? '',
                        'nik' => $s['nik'] ?? null,
                        'teachers' => [$teacher->name],
                        'teacher_ids' => [$teacher->id],
                        'teacher_phones' => [$teacher->phone],
                        'sanggars' => $sanggarName ? [$sanggarName] : [],
                    ];

                    if ($pId) {
                        if (isset($apiStudentsById[$pId])) {
                            $apiStudentsById[$pId]['teachers'][] = $teacher->name;
                            $apiStudentsById[$pId]['teacher_ids'][] = $teacher->id;
                            $apiStudentsById[$pId]['teacher_phones'][] = $teacher->phone;
                            if ($sanggarName) {
                                $apiStudentsById[$pId]['sanggars'][] = $sanggarName;
                            }
                        } else {
                            $apiStudentsById[$pId] = $entry;
                        }
                    }
                    if ($sNik && $sNik !== '-' && $sNik !== '0' && strlen($sNik) >= 10) {
                        if (isset($apiStudentsByNik[$sNik])) {
                            $apiStudentsByNik[$sNik]['teachers'][] = $teacher->name;
                            $apiStudentsByNik[$sNik]['teacher_ids'][] = $teacher->id;
                            $apiStudentsByNik[$sNik]['teacher_phones'][] = $teacher->phone;
                            if ($sanggarName) {
                                $apiStudentsByNik[$sNik]['sanggars'][] = $sanggarName;
                            }
                        } else {
                            $apiStudentsByNik[$sNik] = $entry;
                        }
                    }
                    if ($sName) {
                        if (isset($apiStudentsByName[$sName])) {
                            $apiStudentsByName[$sName]['teachers'][] = $teacher->name;
                            $apiStudentsByName[$sName]['teacher_ids'][] = $teacher->id;
                            $apiStudentsByName[$sName]['teacher_phones'][] = $teacher->phone;
                            if ($sanggarName) {
                                $apiStudentsByName[$sName]['sanggars'][] = $sanggarName;
                            }
                        } else {
                            $apiStudentsByName[$sName] = $entry;
                        }
                    }
                }
                $bar->advance();
            }
            $bar->finish();
            $this->line('');

            $crossMismatches = [];
            foreach ($participants as $p) {
                $pId = (int) ($p->student?->penyaluran_id ?? 0);
                $dbNik = trim((string) ($p->student?->nik ?? $p->nik ?? ''));
                $dbName = strtolower(trim((string) ($p->student?->full_name ?? '')));

                // Match in Penyaluran API by ID, then NIK, then Name
                $official = null;
                if ($pId && isset($apiStudentsById[$pId])) {
                    $official = $apiStudentsById[$pId];
                } elseif ($dbNik && isset($apiStudentsByNik[$dbNik])) {
                    $official = $apiStudentsByNik[$dbNik];
                } elseif ($dbName && isset($apiStudentsByName[$dbName])) {
                    $official = $apiStudentsByName[$dbName];
                }

                if ($official) {
                    $officialTeachers = $official['teachers'] ?? [$official['official_teacher_name']];
                    $officialTeacherIds = $official['teacher_ids'] ?? [$official['official_teacher_id']];
                    $officialSanggars = $official['sanggars'] ?? [$official['sanggar_name']];

                    $registeredTeacherId = (int) ($p->mentor_id ?? 0);
                    $registeredSanggar = trim((string) ($p->penyaluran_sanggar_name ?? '-'));

                    $isTeacherInOfficial = in_array($registeredTeacherId, $officialTeacherIds, true);
                    $isSanggarInOfficial = in_array($registeredSanggar, $officialSanggars, true);

                    if (! $isTeacherInOfficial || ! $isSanggarInOfficial) {
                        $crossMismatches[] = [
                            'participant_id' => $p->id,
                            'reg_no' => $p->registration_number,
                            'student_id' => $p->student_id,
                            'penyaluran_id' => $pId ?: ($official['student_id'] ?? '-'),
                            'student_name' => $p->student?->full_name ?? $official['name'],
                            'nik' => $dbNik ?: ($official['nik'] ?? '-'),
                            'registered_teacher' => $p->mentor?->name ?? "ID: {$registeredTeacherId}",
                            'registered_sanggar' => $registeredSanggar,
                            'official_teacher' => implode(', ', array_unique($officialTeachers)),
                            'official_sanggar' => implode(', ', array_unique($officialSanggars)),
                            'olimpiade' => $p->olimpiade?->name ?? 'OMATIQ',
                            'diff_type' => (! $isTeacherInOfficial && ! $isSanggarInOfficial) ? 'Beda Guru & Sanggar' : (! $isTeacherInOfficial ? 'Beda Guru' : 'Beda Sanggar'),
                        ];
                    }
                }
            }

            $this->line('');
            $this->warn('⚠️  HASIL AUDIT DATA PESERTA (PARTICIPANTS 2026): '.count($crossMismatches).' ditemukan mismatch.');
            if (! empty($crossMismatches)) {
                $this->table(
                    ['No', 'Peserta ID', 'No Reg', 'Nama Santri', 'NIK', 'Guru Pendaftar', 'Sanggar Pendaftar', 'Guru Asli (Penyaluran)', 'Sanggar Asli (Penyaluran)', 'Tipe'],
                    collect($crossMismatches)->map(fn ($r, $idx) => [
                        $idx + 1,
                        $r['participant_id'],
                        $r['reg_no'],
                        $r['student_name'],
                        $r['nik'],
                        $r['registered_teacher'],
                        $r['registered_sanggar'],
                        $r['official_teacher'],
                        $r['official_sanggar'],
                        $r['diff_type'],
                    ])->toArray()
                );
            }

            // Also check all master Students (including draft / cancelled / historical)
            $allStudents = Student::with('mentor')->get();
            $masterStudentMismatches = [];
            foreach ($allStudents as $s) {
                $pId = (int) ($s->penyaluran_id ?? 0);
                $dbNik = trim((string) ($s->nik ?? ''));
                $dbName = strtolower(trim((string) ($s->full_name ?? '')));

                $official = null;
                if ($pId && isset($apiStudentsById[$pId])) {
                    $official = $apiStudentsById[$pId];
                } elseif ($dbNik && isset($apiStudentsByNik[$dbNik])) {
                    $official = $apiStudentsByNik[$dbNik];
                } elseif ($dbName && isset($apiStudentsByName[$dbName])) {
                    $official = $apiStudentsByName[$dbName];
                }

                if ($official) {
                    $officialTeacherIds = $official['teacher_ids'] ?? [];
                    $officialTeachers = $official['teachers'] ?? [];
                    $officialSanggars = $official['sanggars'] ?? [];
                    $localMentorId = (int) ($s->mentor_id ?? 0);

                    if ($localMentorId && ! in_array($localMentorId, $officialTeacherIds, true)) {
                        $masterStudentMismatches[] = [
                            'student_id' => $s->id,
                            'penyaluran_id' => $pId ?: ($official['student_id'] ?? '-'),
                            'student_name' => $s->full_name,
                            'nik' => $s->nik,
                            'local_mentor' => $s->mentor?->name ?? "ID: {$localMentorId}",
                            'official_teachers' => implode(', ', array_unique($officialTeachers)),
                            'official_sanggars' => implode(', ', array_unique($officialSanggars)),
                        ];
                    }
                }
            }

            $this->line('');
            $this->warn('⚠️  HASIL AUDIT MASTER SANTRI (STUDENTS TABLE): '.count($masterStudentMismatches).' santri tercatat di Guru lain di database lokal:');
            if (! empty($masterStudentMismatches)) {
                $this->table(
                    ['No', 'Student ID', 'Penyaluran ID', 'Nama Santri', 'NIK', 'Guru di Master DB', 'Guru Asli (Penyaluran API)', 'Sanggar Asli (Penyaluran API)'],
                    collect($masterStudentMismatches)->map(fn ($r, $idx) => [
                        $idx + 1,
                        $r['student_id'],
                        $r['penyaluran_id'],
                        $r['student_name'],
                        $r['nik'],
                        $r['local_mentor'],
                        $r['official_teachers'],
                        $r['official_sanggars'],
                    ])->toArray()
                );
            }

            return self::SUCCESS;
        }

        if ($auditNoNik) {
            $this->info('================================================================================');
            $this->info('🔍 AUDIT PESERTA TERDAFTAR DENGAN NIK KOSONG/INVALID DI API PENYALURAN');
            $this->info('================================================================================');

            $participants = Participant::with(['student', 'mentor', 'olimpiade:id,name'])
                ->where(fn ($q) => $q->where('event_year', 2026)->orWhereNull('event_year'))
                ->whereIn('status', ['submitted', 'verified'])
                ->get();

            $this->info("Total peserta terdaftar (2026): {$participants->count()}");

            // 1. Check participants whose student has random/invalid NIK in local DB
            $invalidNikInDb = $participants->filter(function (Participant $p) {
                $n = trim((string) ($p->student?->nik ?? $p->nik ?? ''));

                return ! ctype_digit($n) || strlen($n) !== 16;
            });

            $this->line('');
            $this->warn("1. Peserta dengan NIK Abnormal / Random String di Database ({$invalidNikInDb->count()} peserta):");
            if ($invalidNikInDb->isNotEmpty()) {
                $this->table(
                    ['Peserta ID', 'No Reg', 'Student ID', 'Penyaluran ID', 'Nama Santri', 'NIK di DB', 'Guru / Mentor'],
                    $invalidNikInDb->map(fn ($p) => [
                        $p->id,
                        $p->registration_number,
                        $p->student_id,
                        $p->student?->penyaluran_id ?? '-',
                        $p->student?->full_name ?? '-',
                        $p->student?->nik ?? $p->nik ?? '-',
                        $p->mentor?->name ?? 'None',
                    ])->toArray()
                );
            }

            // 2. Fetch all teachers' Penyaluran rosters to check Penyaluran API NIK
            $teachers = User::role('Teacher')->whereNotNull('phone')->get(['id', 'name', 'phone', 'penyaluran_token']);
            $this->line('');
            $this->info("2. Memeriksa data NIK resmi di API Penyaluran dari {$teachers->count()} akun Guru...");

            $apiStudentsById = [];
            $bar = $this->output->createProgressBar($teachers->count());
            $bar->start();

            foreach ($teachers as $teacher) {
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
                    }
                }

                foreach ($students as $s) {
                    $pId = (int) ($s['student_id'] ?? $s['id'] ?? 0);
                    if ($pId) {
                        $apiStudentsById[$pId] = $s;
                    }
                }
                $bar->advance();
            }
            $bar->finish();
            $totalParticipantsCount = $participants->count();
            $umumParticipants = $participants->where('registration_type', 'public')->count();
            $binaanParticipants = $participants->where('registration_type', 'teacher');

            $randomNikInDbCount = $invalidNikInDb->count();

            $withPenyaluranId = $binaanParticipants->filter(fn ($p) => filled($p->student?->penyaluran_id));
            $withoutPenyaluranId = $binaanParticipants->filter(fn ($p) => blank($p->student?->penyaluran_id));

            $hasNikInPenyaluran = [];
            $noNikInPenyaluran = [];

            foreach ($binaanParticipants as $p) {
                $pId = (int) ($p->student?->penyaluran_id ?? 0);
                $dbNik = trim((string) ($p->student?->nik ?? $p->nik ?? ''));
                $apiStudent = $pId ? ($apiStudentsById[$pId] ?? null) : null;

                $apiNik = ! empty($apiStudent['nik']) ? trim((string) $apiStudent['nik']) : null;
                $hasValidApiNik = $apiNik && $apiNik !== '-' && $apiNik !== '0' && ctype_digit($apiNik) && strlen($apiNik) === 16;

                $isDbNikReal = ctype_digit($dbNik) && strlen($dbNik) === 16;

                if ($hasValidApiNik) {
                    $hasNikInPenyaluran[] = $p;
                } else {
                    $noNikInPenyaluran[] = [
                        'participant_id' => $p->id,
                        'reg_no' => $p->registration_number,
                        'student_id' => $p->student_id,
                        'penyaluran_id' => $pId ?: '-',
                        'student_name' => $p->student?->full_name ?? $apiStudent['name'] ?? '-',
                        'db_nik' => $dbNik,
                        'is_random_nik' => ! $isDbNikReal,
                        'penyaluran_nik' => $apiNik ?: '(KOSONG / -)',
                        'mentor_name' => $p->mentor?->name ?? '-',
                        'sanggar_name' => $p->penyaluran_sanggar_name ?? $apiStudent['sanggar_name'] ?? '-',
                    ];
                }
            }

            $this->line('');
            $this->info('📊 RINGKASAN REKAPITULASI AUDIT NIK PENYALURAN:');
            $this->table(
                ['Kategori', 'Jumlah Peserta', 'Persentase', 'Keterangan'],
                [
                    ['Total Peserta Terdaftar (2026)', $totalParticipantsCount, '100%', 'Semua peserta aktif (submitted + verified)'],
                    [' - Peserta Jalur Umum', $umumParticipants, round(($umumParticipants / $totalParticipantsCount) * 100, 1).'%', 'Pendaftar mandiri (bukan binaan sanggar)'],
                    [' - Peserta Jalur Binaan Guru', $binaanParticipants->count(), round(($binaanParticipants->count() / $totalParticipantsCount) * 100, 1).'%', 'Santri binaan sanggar Laznas Yatim Mandiri'],
                    ['', '', '', ''],
                    ['1. Binaan yang SUDAH Punya NIK Valid di Penyaluran API', count($hasNikInPenyaluran), round((count($hasNikInPenyaluran) / max(1, $binaanParticipants->count())) * 100, 1).'% binaan', 'NIK 16 digit lengkap di API Penyaluran'],
                    ['2. Binaan yang BELUM Punya NIK di Penyaluran API', count($noNikInPenyaluran), round((count($noNikInPenyaluran) / max(1, $binaanParticipants->count())) * 100, 1).'% binaan', 'NIK kosong / strip (-) di server Penyaluran'],
                    ['   a. NIK di DB Omatiq sudah diisi 16 digit asli', collect($noNikInPenyaluran)->where('is_random_nik', false)->count(), '-', 'Guru/Admin melengkapi NIK di form Omatiq'],
                    ['   b. NIK di DB Omatiq masih Random String (Sistem Lama)', collect($noNikInPenyaluran)->where('is_random_nik', true)->count(), '-', 'Santri tanpa NIK yang digenerate random oleh sistem lama'],
                ]
            );

            $this->line('');
            $this->warn('⚠️  Daftar 15 Peserta Teratas yang NIK-nya Masih Kosong di API Penyaluran (Total: '.count($noNikInPenyaluran).'):');
            $this->table(
                ['Peserta ID', 'No Reg', 'Student ID', 'Penyaluran ID', 'Nama Santri', 'NIK di Omatiq DB', 'Tipe NIK DB', 'NIK di Penyaluran API', 'Guru Pendaftar'],
                collect($noNikInPenyaluran)->take(15)->map(fn ($r) => [
                    $r['participant_id'],
                    $r['reg_no'],
                    $r['student_id'],
                    $r['penyaluran_id'],
                    $r['student_name'],
                    $r['db_nik'],
                    $r['is_random_nik'] ? 'RANDOM STRING' : '16 DIGIT (MANUAL)',
                    $r['penyaluran_nik'],
                    $r['mentor_name'],
                ])->toArray()
            );

            return self::SUCCESS;
        }

        if ($range) {
            [$start, $end] = explode('-', $range);
            $students = Student::whereBetween('id', [(int) $start, (int) $end])->get(['id', 'penyaluran_id', 'full_name', 'nik', 'mentor_id', 'mentor_name', 'created_at']);
            $this->table(
                ['Student ID', 'Penyaluran ID', 'Nama Santri', 'NIK', 'Mentor ID', 'Mentor Name', 'Created At'],
                $students->map(fn ($s) => [$s->id, $s->penyaluran_id, $s->full_name, $s->nik, $s->mentor_id, $s->mentor_name, $s->created_at->format('Y-m-d H:i')])->toArray()
            );
        }

        if ($teacherQuery) {
            $user = User::query()
                ->where('email', 'like', "%{$teacherQuery}%")
                ->orWhere('name', 'like', "%{$teacherQuery}%")
                ->orWhere('phone', 'like', "%{$teacherQuery}%")
                ->first();

            if (! $user) {
                $this->error("Guru tidak ditemukan untuk query: {$teacherQuery}");

                return self::FAILURE;
            }

            $this->info("=== GURU: {$user->name} (ID: {$user->id}, Phone: {$user->phone}, Email: {$user->email}) ===");

            // Peserta milik guru ini
            $participants = Participant::with(['olimpiade:id,name', 'student:id,full_name,nik,penyaluran_id,mentor_id'])
                ->where('mentor_id', $user->id)
                ->get();

            $this->info("Total Peserta yang didaftarkan Guru ini di DB: {$participants->count()}");
            if ($participants->isNotEmpty()) {
                $this->table(
                    ['Peserta ID', 'No Reg', 'Student ID', 'Nama Siswa', 'NIK', 'Status', 'Olimpiade', 'Student Mentor ID'],
                    $participants->map(fn ($p) => [
                        $p->id,
                        $p->registration_number,
                        $p->student_id,
                        $p->student?->full_name,
                        $p->nik ?? $p->student?->nik,
                        $p->status,
                        $p->olimpiade?->name,
                        $p->student?->mentor_id ?? '-',
                    ])->toArray()
                );
            }

            // Cek token penyaluran
            if ($user->penyaluran_token) {
                try {
                    $studentsRaw = $penyaluran->students($user->penyaluran_token);
                    $this->info('Total Santri di Roster Penyaluran Guru ini: '.count($studentsRaw));
                    $this->table(
                        ['Penyaluran ID', 'Nama Santri', 'NIK', 'Sanggar ID', 'Sanggar Name'],
                        collect($studentsRaw)->map(fn ($s) => [
                            $s['student_id'] ?? $s['id'] ?? '-',
                            $s['name'] ?? $s['full_name'] ?? '-',
                            $s['nik'] ?? '-',
                            $s['sanggar_id'] ?? '-',
                            $s['sanggar_name'] ?? '-',
                        ])->toArray()
                    );
                } catch (\Throwable $e) {
                    $this->warn("Gagal fetch roster Penyaluran: {$e->getMessage()}");
                }
            }
        }

        if ($nik || $name) {
            $this->line('');
            $this->info('=== INSPEKSI SANTRI ===');
            $students = Student::query()
                ->when($nik, fn ($q) => $q->where('nik', 'like', "%{$nik}%"))
                ->when($name, fn ($q) => $q->where('full_name', 'like', "%{$name}%"))
                ->with(['participants.mentor:id,name', 'mentor:id,name'])
                ->get();

            $this->info("Ditemukan {$students->count()} data di master students:");
            foreach ($students as $s) {
                $this->line('--------------------------------------------------');
                $this->line("Student ID: {$s->id} | Penyaluran ID: {$s->penyaluran_id} | Nama: {$s->full_name} | NIK: {$s->nik}");
                $this->line("Mentor ID di Student: {$s->mentor_id} (".($s->mentor?->name ?? 'None').')');
                $this->line("Total Pendaftaran di Participants: {$s->participants->count()}");
                foreach ($s->participants as $p) {
                    $this->line("  -> Participant ID: {$p->id} | No Reg: {$p->registration_number} | Status: {$p->status} | Mentor ID: {$p->mentor_id} (".($p->mentor?->name ?? 'None').") | Olimpiade ID: {$p->olimpiade_id}");
                }
            }
        }

        return self::SUCCESS;
    }
}
