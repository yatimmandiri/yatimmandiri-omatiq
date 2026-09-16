<?php

namespace App\Console\Commands;

use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Illuminate\Console\Command;

class InspectTeacherData extends Command
{
    protected $signature = 'omatiq:inspect {--teacher= : Email or Phone or Name of Teacher} {--nik= : NIK of student} {--name= : Name of student} {--range= : ID range e.g. 30-45}';

    protected $description = 'Periksa data detail guru, binaan, dan peserta di database';

    public function handle(PenyaluranService $penyaluran): int
    {
        $teacherQuery = $this->option('teacher');
        $nik = $this->option('nik');
        $name = $this->option('name');
        $range = $this->option('range');

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
