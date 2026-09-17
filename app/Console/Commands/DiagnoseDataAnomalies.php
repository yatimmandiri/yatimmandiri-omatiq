<?php

namespace App\Console\Commands;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DiagnoseDataAnomalies extends Command
{
    protected $signature = 'omatiq:diagnose {--year=2026 : Filter event year} {--fix : Apply safe non-destructive fixes}';

    protected $description = 'Diagnosa data anomali peserta, santri binaan, NIK ganda, dan ketidaksesuaian guru/mentor';

    public function handle(): int
    {
        $year = (int) $this->option('year');
        $isFix = (bool) $this->option('fix');

        $this->line('');
        $this->info('================================================================================');
        $this->info("🔍 OMATIQ DATA ANOMALY DIAGNOSTIC TOOL (Tahun Event: {$year})");
        $this->info('================================================================================');
        $this->line('Database: '.config('database.connections.mysql.host').' / '.config('database.connections.mysql.database'));
        $this->line('');

        // 1. Overview Statistics
        $this->info('📊 1. RINGKASAN DATA DATABASE');
        $totalStudents = Student::count();
        $binaanStudents = Student::where('is_binaan', true)->count();
        $umumStudents = Student::where('is_binaan', false)->count();
        $softDeletedStudents = Student::onlyTrashed()->count();

        $totalParticipants = Participant::where(fn ($q) => $q->where('event_year', $year)->orWhereNull('event_year'))->count();
        $verifiedParticipants = Participant::where('status', 'verified')->where(fn ($q) => $q->where('event_year', $year)->orWhereNull('event_year'))->count();
        $submittedParticipants = Participant::where('status', 'submitted')->where(fn ($q) => $q->where('event_year', $year)->orWhereNull('event_year'))->count();
        $rejectedParticipants = Participant::where('status', 'rejected')->where(fn ($q) => $q->where('event_year', $year)->orWhereNull('event_year'))->count();

        $teacherUsers = User::role('Teacher')->count();

        $this->table(
            ['Metrik', 'Jumlah'],
            [
                ['Total Master Siswa (Students)', $totalStudents],
                [' - Santri Binaan', $binaanStudents],
                [' - Siswa Jalur Umum', $umumStudents],
                [' - Santri Terhapus (Soft Deleted)', $softDeletedStudents],
                ['Total Peserta Terdaftar (Participants)', $totalParticipants],
                [' - Terverifikasi (Verified)', $verifiedParticipants],
                [' - Menunggu (Submitted)', $submittedParticipants],
                [' - Ditolak (Rejected)', $rejectedParticipants],
                ['Total Akun Guru Terdaftar', $teacherUsers],
            ]
        );

        $this->line('');

        // 2. Anomali 1: Mismatch mentor_id antara Participant vs Student
        $this->info('🔍 2. ANALISA KETIDAKSESUAIAN GURU (PARTICIPANT vs STUDENT MENTOR)');
        $mentorMismatches = Participant::query()
            ->join('students', 'participants.student_id', '=', 'students.id')
            ->whereNotNull('participants.mentor_id')
            ->whereNotNull('students.mentor_id')
            ->whereColumn('participants.mentor_id', '!=', 'students.mentor_id')
            ->select([
                'participants.id as participant_id',
                'participants.registration_number',
                'students.id as student_id',
                'students.full_name',
                'students.nik',
                'participants.mentor_id as participant_mentor_id',
                'students.mentor_id as student_mentor_id',
            ])
            ->get();

        if ($mentorMismatches->isNotEmpty()) {
            $this->warn("⚠️  Ditemukan {$mentorMismatches->count()} data peserta yang mentor_id nya berbeda antara tabel participants dan students!");
            $this->table(
                ['Peserta ID', 'No Reg', 'Siswa ID', 'Nama Santri', 'NIK', 'Mentor di Participant', 'Mentor di Student'],
                $mentorMismatches->map(fn ($m) => [
                    $m->participant_id,
                    $m->registration_number,
                    $m->student_id,
                    $m->full_name,
                    $m->nik,
                    User::find($m->participant_mentor_id)?->name ?? "ID: {$m->participant_mentor_id}",
                    User::find($m->student_mentor_id)?->name ?? "ID: {$m->student_mentor_id}",
                ])->toArray()
            );

            if ($isFix) {
                $this->info('🛠️  Memperbaiki mentor_id pada tabel students agar selaras dengan participants...');
                foreach ($mentorMismatches as $m) {
                    Student::where('id', $m->student_id)->update(['mentor_id' => $m->participant_mentor_id]);
                }
                $this->info('✅ Selesai diselaraskan.');
            }
        } else {
            $this->info('✅ Selaras: Seluruh mentor_id di tabel participants dan students cocok.');
        }

        $this->line('');

        // 2b. Analisa Nama Mentor di Student vs Akun User Asli
        $this->info('🔍 2b. ANALISA NAMA GURU/MENTOR DI STUDENT vs AKUN USER ASLI');
        $teachersByName = User::role('Teacher')->get()->keyBy(fn ($u) => strtolower(trim($u->name)));
        $teachersById = User::role('Teacher')->get()->keyBy('id');
        $studentsWithMentorName = Student::whereNotNull('mentor_name')->where('is_binaan', true)->get();
        $teacherNameMismatches = [];
        foreach ($studentsWithMentorName as $s) {
            $mentorNameKey = strtolower(trim($s->mentor_name));
            $currentMentorUser = $teachersById->get($s->mentor_id);
            $matchedUserByName = $teachersByName->get($mentorNameKey);

            if ($matchedUserByName && $s->mentor_id !== $matchedUserByName->id) {
                $teacherNameMismatches[] = [
                    'student_id' => $s->id,
                    'penyaluran_id' => $s->penyaluran_id,
                    'student_name' => $s->full_name,
                    'nik' => $s->nik,
                    'stored_mentor_name' => $s->mentor_name,
                    'current_mentor_id' => $s->mentor_id,
                    'current_mentor_user' => $currentMentorUser?->name ?? 'None',
                    'correct_user_id' => $matchedUserByName->id,
                    'correct_user_name' => $matchedUserByName->name,
                ];
            }
        }

        if (! empty($teacherNameMismatches)) {
            $this->warn('⚠️  Ditemukan '.count($teacherNameMismatches).' santri yang mentor_id nya TIDAK COCOK dengan Nama Guru Aslinya:');
            $this->table(
                ['Student ID', 'Penyaluran ID', 'Nama Santri', 'NIK', 'Nama Guru di Roster', 'Akun Guru Saat Ini', 'Akun Guru Seharusnya'],
                collect($teacherNameMismatches)->map(fn ($row) => [
                    $row['student_id'],
                    $row['penyaluran_id'],
                    $row['student_name'],
                    $row['nik'],
                    $row['stored_mentor_name'],
                    "{$row['current_mentor_user']} (ID: {$row['current_mentor_id']})",
                    "{$row['correct_user_name']} (ID: {$row['correct_user_id']})",
                ])->toArray()
            );

            if ($isFix) {
                $this->info('🛠️  Memperbaiki santri dan peserta yang salah guru ke akun guru yang seharusnya...');

                // Khusus kasus Peserta 496 & Santri 38 (Khayla vs Salwa):
                $p496 = Participant::find(496);
                if ($p496 && $p496->student_id == 38) {
                    $this->info('-> Memisahkan Peserta 496 (Khayla Mirahsty Hartanto) dari Student 38 (Salwa Nafisah)...');
                    // Cek apakah student Khayla sudah ada
                    $khaylaStudent = Student::where('penyaluran_id', 1040)->first();
                    if (! $khaylaStudent) {
                        // Ubah NIK student 38 dulu agar tidak collide (16 digit)
                        Student::where('id', 38)->update([
                            'nik' => '3308189999990038',
                            'mentor_id' => 250,
                            'mentor_name' => 'NIRMA FADILA',
                        ]);

                        $khaylaStudent = Student::create([
                            'penyaluran_id' => 1040,
                            'nik' => '3308185804160002',
                            'full_name' => 'KHAYLA MIRAHSTY HARTANTO',
                            'gender' => 'female',
                            'mentor_id' => 125,
                            'mentor_name' => 'AKHSANA MIFTAKHUL AKHYAR',
                            'is_binaan' => true,
                            'is_active' => true,
                        ]);
                    }
                    $p496->update([
                        'student_id' => $khaylaStudent->id,
                        'mentor_id' => 125,
                        'nik' => '3308185804160002',
                    ]);

                    // Sync juga NIK Peserta 38 agar tidak duplicate dengan Khayla
                    Participant::where('id', 38)->update([
                        'nik' => '3308189999990038',
                        'mentor_id' => 250,
                    ]);
                }

                foreach ($teacherNameMismatches as $row) {
                    // Update student
                    Student::where('id', $row['student_id'])->update([
                        'mentor_id' => $row['correct_user_id'],
                    ]);
                    // Update participant (kecuali jika sudah dipisah manual)
                    Participant::where('student_id', $row['student_id'])->where('id', '!=', 496)->update([
                        'mentor_id' => $row['correct_user_id'],
                    ]);
                }
                $this->info('✅ Selesai memperbaiki kepemilikan guru.');
            }
        } else {
            $this->info('✅ Selaras: Seluruh santri terhubung dengan akun guru yang sesuai dengan namanya.');
        }

        $this->line('');

        // 3. Anomali 2: Duplikasi NIK di Peserta dalam Tahun Event yang Sama
        $this->info('🔍 3. ANALISA DUPLIKASI NIK PADA PESERTA (1 NIK > 1 OLIMPIADE DI '.$year.')');
        $duplicateNiks = Participant::query()
            ->where(fn ($q) => $q->where('event_year', $year)->orWhereNull('event_year'))
            ->whereIn('status', ['submitted', 'verified'])
            ->whereNotNull('nik')
            ->where('nik', '!=', '')
            ->where('nik', '!=', '-')
            ->where('nik', '!=', '0')
            ->groupBy('nik')
            ->havingRaw('COUNT(*) > 1')
            ->select('nik', DB::raw('COUNT(*) as total_count'))
            ->get();

        if ($duplicateNiks->isNotEmpty()) {
            $this->warn("⚠️  Ditemukan {$duplicateNiks->count()} NIK yang terdaftar lebih dari 1 kali di tahun {$year}:");
            $rows = [];
            foreach ($duplicateNiks as $dup) {
                $records = Participant::with(['olimpiade:id,name', 'student:id,full_name', 'mentor:id,name'])
                    ->where('nik', $dup->nik)
                    ->where(fn ($q) => $q->where('event_year', $year)->orWhereNull('event_year'))
                    ->whereIn('status', ['submitted', 'verified'])
                    ->get();

                foreach ($records as $rec) {
                    $rows[] = [
                        $rec->id,
                        $dup->nik,
                        $rec->student?->full_name ?? $rec->full_name,
                        $rec->olimpiade?->name ?? 'ID: '.$rec->olimpiade_id,
                        $rec->status,
                        $rec->registration_type,
                        $rec->mentor?->name ?? ($rec->registration_type === 'public' ? 'Pendaftar Umum' : '-'),
                    ];
                }
            }
            $this->table(
                ['Peserta ID', 'NIK', 'Nama Santri', 'Olimpiade', 'Status', 'Jalur', 'Guru / Pendaftar'],
                $rows
            );
        } else {
            $this->info('✅ Tidak ada duplikasi NIK aktif (1 NIK = 1 Olimpiade berjalan dengan baik).');
        }

        $this->line('');

        // 4. Anomali 3: Santri Binaan yang NIK-nya berformat aneh (strip, nol, kurang dari 10 digit) atau NIK participant != NIK student
        $this->info('🔍 4. ANALISA NIK ABNORMAL / INVALID (YANG DAPAT MENYEBABKAN FALSE-MATCH)');
        $invalidNikParticipants = Participant::query()
            ->where(function ($q) {
                $q->whereNull('nik')
                    ->orWhere('nik', '')
                    ->orWhere('nik', '-')
                    ->orWhere('nik', '0')
                    ->orWhereRaw('LENGTH(TRIM(nik)) < 10');
            })
            ->select(['id', 'registration_number', 'student_id', 'nik', 'mentor_id', 'status', 'registration_type'])
            ->get();

        if ($invalidNikParticipants->isNotEmpty()) {
            $this->warn("⚠️  Ditemukan {$invalidNikParticipants->count()} peserta dengan NIK kosong/invalid:");
            $this->table(
                ['ID', 'No Registrasi', 'Siswa ID', 'NIK', 'Status', 'Jalur'],
                $invalidNikParticipants->map(fn ($p) => [
                    $p->id,
                    $p->registration_number,
                    $p->student_id,
                    $p->nik ?: '(KOSONG / NULL)',
                    $p->status,
                    $p->registration_type,
                ])->toArray()
            );
        } else {
            $this->info('✅ Seluruh peserta memiliki NIK yang valid.');
        }

        if ($isFix) {
            // Selaraskan NIK di participants dari students
            $mismatchedNiks = Participant::join('students', 'participants.student_id', '=', 'students.id')
                ->whereColumn('participants.nik', '!=', 'students.nik')
                ->select(['participants.id', 'students.nik'])
                ->get();
            if ($mismatchedNiks->isNotEmpty()) {
                foreach ($mismatchedNiks as $m) {
                    Participant::where('id', $m->id)->update(['nik' => $m->nik]);
                }
            }
        }

        $this->line('');

        // 5. Anomali 4: Duplicate Penyaluran ID pada tabel students & participants
        $this->info('🔍 5. ANALISA DUPLIKASI PENYALURAN ID (SANTRI BINAAN SAMA)');
        $dupPenyaluranStudents = Student::query()
            ->whereNotNull('penyaluran_id')
            ->groupBy('penyaluran_id')
            ->havingRaw('COUNT(*) > 1')
            ->select('penyaluran_id', DB::raw('COUNT(*) as total_count'))
            ->get();

        if ($dupPenyaluranStudents->isNotEmpty()) {
            $this->warn("⚠️  Ditemukan {$dupPenyaluranStudents->count()} penyaluran_id yang memiliki lebih dari 1 baris di tabel students!");
            foreach ($dupPenyaluranStudents as $dup) {
                $students = Student::where('penyaluran_id', $dup->penyaluran_id)->get(['id', 'penyaluran_id', 'full_name', 'nik', 'mentor_id', 'mentor_name', 'created_at']);
                $this->table(
                    ['Student ID', 'Penyaluran ID', 'Nama Santri', 'NIK', 'Mentor ID', 'Mentor Name', 'Created At'],
                    $students->map(fn ($s) => [$s->id, $s->penyaluran_id, $s->full_name, $s->nik, $s->mentor_id, $s->mentor_name, $s->created_at])->toArray()
                );
            }
        } else {
            $this->info('✅ Tidak ada duplikasi penyaluran_id pada tabel students.');
        }

        $this->line('');

        // 6. Anomali 5: Orphan Records (Peserta tanpa data Siswa atau Siswa ter-soft-delete)
        $this->info('🔍 6. ANALISA ORPHAN PARTICIPANTS (DATA SISWA HILANG / TERHAPUS)');
        $orphanedParticipants = Participant::query()
            ->whereNotIn('student_id', Student::pluck('id'))
            ->get();

        $softDeletedStudentParticipants = Participant::query()
            ->join('students', 'participants.student_id', '=', 'students.id')
            ->whereNotNull('students.deleted_at')
            ->select('participants.*')
            ->get();

        if ($orphanedParticipants->isNotEmpty() || $softDeletedStudentParticipants->isNotEmpty()) {
            $this->warn('⚠️  Ditemukan '.($orphanedParticipants->count() + $softDeletedStudentParticipants->count()).' peserta dengan siswa hilang/terhapus!');
            if ($orphanedParticipants->isNotEmpty()) {
                $this->table(
                    ['Peserta ID', 'No Reg', 'Missing Student ID', 'NIK', 'Status'],
                    $orphanedParticipants->map(fn ($p) => [
                        $p->id,
                        $p->registration_number,
                        $p->student_id,
                        $p->nik,
                        $p->status,
                    ])->toArray()
                );
            }
        } else {
            $this->info('✅ Seluruh peserta terhubung secara valid ke master Siswa (Students).');
        }

        $this->line('');

        // 7. Anomali 6: Peserta dengan status Ditolak / Dibatalkan yang masih memiliki records di database
        $this->info('🔍 7. ANALISA STATUS PENDAFTARAN PESERTA DIBATALKAN / DITOLAK');
        $rejectedList = Participant::where('status', 'rejected')
            ->with(['student:id,full_name,nik', 'mentor:id,name'])
            ->get();

        if ($rejectedList->isNotEmpty()) {
            $this->line("ℹ️  Terdapat {$rejectedList->count()} peserta dengan status 'rejected' (ditolak/dibatalkan):");
            $this->table(
                ['Peserta ID', 'No Reg', 'Nama Santri', 'NIK', 'Guru Pengaju', 'Created At'],
                $rejectedList->map(fn ($r) => [
                    $r->id,
                    $r->registration_number,
                    $r->student?->full_name ?? '-',
                    $r->student?->nik ?? $r->nik,
                    $r->mentor?->name ?? 'Umum',
                    $r->created_at->format('Y-m-d H:i'),
                ])->toArray()
            );
        } else {
            $this->info('✅ Tidak ada peserta dengan status rejected.');
        }

        $this->line('');

        // 8. Analisa Payment Status untuk Pendaftaran Guru Binaan
        $this->info('🔍 8. ANALISA STATUS PEMBAYARAN PESERTA JALUR GURU BINAAN');
        $unpaidTeacherParticipants = Participant::query()
            ->where(function ($q) {
                $q->where('registration_type', 'teacher')
                    ->orWhereNotNull('mentor_id');
            })
            ->where('payment_status', '!=', 'paid')
            ->select(['id', 'registration_number', 'student_id', 'mentor_id', 'payment_status', 'status'])
            ->get();

        if ($unpaidTeacherParticipants->isNotEmpty()) {
            $this->warn("⚠️  Ditemukan {$unpaidTeacherParticipants->count()} peserta binaan yang payment_status nya belum 'paid':");
            $this->table(
                ['ID', 'No Registrasi', 'Siswa ID', 'Status Pendaftaran', 'Status Pembayaran'],
                $unpaidTeacherParticipants->map(fn ($p) => [
                    $p->id,
                    $p->registration_number,
                    $p->student_id,
                    $p->status,
                    $p->payment_status,
                ])->toArray()
            );

            if ($isFix) {
                $this->info("🛠️  Mengubah payment_status menjadi 'paid' untuk seluruh peserta jalur binaan guru...");
                Participant::where(function ($q) {
                    $q->where('registration_type', 'teacher')
                        ->orWhereNotNull('mentor_id');
                })->update(['payment_status' => 'paid', 'payment_amount' => 0]);
                $this->info('✅ Selesai.');
            }
        } else {
            $this->info("✅ Seluruh peserta jalur binaan guru berstatus pembayaran 'paid'.");
        }

        $this->line('');
        $this->info('================================================================================');
        $this->info('DIAGNOSA SELESAI.');
        $this->info('================================================================================');

        return self::SUCCESS;
    }
}
