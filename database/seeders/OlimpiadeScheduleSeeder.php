<?php

namespace Database\Seeders;

use App\Models\Company\Olimpiade;
use App\Models\Company\OlimpiadeSchedule;
use Illuminate\Database\Seeder;

class OlimpiadeScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $alquran = Olimpiade::query()->where('slug', 'olimpiade-alquran')->first();
        $math = Olimpiade::query()->where('slug', 'olimpiade-matematika')->first();

        $items = [
            [
                'olimpiade' => $alquran,
                'title' => "Registrasi Olimpiade Al-Qur'an",
                'phase' => 'registration',
                'start_date' => '2026-07-01',
                'end_date' => '2026-08-10',
                'location' => 'Online Nasional',
                'description' => "Pendaftaran peserta cabang Al-Qur'an untuk sekolah, TPQ, orang tua, dan pendamping daerah.",
                'action_label' => "Daftar Al-Qur'an",
                'action_url' => '/kontak',
                'color' => '#F15F23',
                'sort_order' => 1,
            ],
            [
                'olimpiade' => $math,
                'title' => 'Registrasi Olimpiade Matematika',
                'phase' => 'registration',
                'start_date' => '2026-07-01',
                'end_date' => '2026-08-10',
                'location' => 'Online Nasional',
                'description' => 'Pendaftaran peserta cabang Matematika untuk anak yang siap mengasah logika dan strategi soal.',
                'action_label' => 'Daftar Matematika',
                'action_url' => '/kontak',
                'color' => '#0F60AC',
                'sort_order' => 2,
            ],
            [
                'olimpiade' => $alquran,
                'title' => "Technical Meeting Al-Qur'an",
                'phase' => 'technical_meeting',
                'start_date' => '2026-08-17',
                'end_date' => null,
                'location' => 'Online via Zoom',
                'description' => 'Penjelasan aturan, alur lomba, perangkat, dan sesi tanya jawab bersama panitia.',
                'color' => '#56CCF2',
                'sort_order' => 3,
            ],
            [
                'olimpiade' => $math,
                'title' => 'Technical Meeting Matematika',
                'phase' => 'technical_meeting',
                'start_date' => '2026-08-18',
                'end_date' => null,
                'location' => 'Online via Zoom',
                'description' => 'Briefing format soal, aturan pengerjaan, dan simulasi teknis peserta.',
                'color' => '#56CCF2',
                'sort_order' => 4,
            ],
            [
                'olimpiade' => $alquran,
                'title' => "Babak Penyisihan Al-Qur'an",
                'phase' => 'preliminary',
                'start_date' => '2026-08-24',
                'end_date' => '2026-08-25',
                'location' => 'Online Terjadwal',
                'description' => 'Peserta mengikuti seleksi awal tajwid dan ketepatan cara baca.',
                'color' => '#FFC857',
                'sort_order' => 5,
            ],
            [
                'olimpiade' => $math,
                'title' => 'Babak Penyisihan Matematika',
                'phase' => 'preliminary',
                'start_date' => '2026-08-26',
                'end_date' => '2026-08-27',
                'location' => 'Online Terjadwal',
                'description' => 'Peserta mengerjakan soal seleksi awal untuk menentukan peserta fase gugur.',
                'color' => '#FFC857',
                'sort_order' => 6,
            ],
            [
                'olimpiade' => $alquran,
                'title' => "Fase Knockout Al-Qur'an",
                'phase' => 'knockout',
                'start_date' => '2026-09-07',
                'end_date' => '2026-09-10',
                'location' => 'Online Nasional',
                'description' => 'Peserta terbaik bertanding dalam fase gugur menuju final.',
                'color' => '#5DD39E',
                'sort_order' => 7,
            ],
            [
                'olimpiade' => $math,
                'title' => 'Fase Knockout Matematika',
                'phase' => 'knockout',
                'start_date' => '2026-09-11',
                'end_date' => '2026-09-14',
                'location' => 'Online Nasional',
                'description' => 'Babak gugur Matematika dengan soal bertahap dan tantangan strategi.',
                'color' => '#5DD39E',
                'sort_order' => 8,
            ],
            [
                'olimpiade' => $alquran,
                'title' => "Final Nasional Al-Qur'an",
                'phase' => 'final',
                'start_date' => '2026-10-03',
                'end_date' => null,
                'location' => 'Final Nasional',
                'description' => "Finalis Al-Qur'an tampil di panggung puncak OMATIQ.",
                'color' => '#8B5CF6',
                'sort_order' => 9,
            ],
            [
                'olimpiade' => $math,
                'title' => 'Final Nasional Matematika',
                'phase' => 'final',
                'start_date' => '2026-10-04',
                'end_date' => null,
                'location' => 'Final Nasional',
                'description' => 'Finalis Matematika menyelesaikan tantangan puncak dan penentuan juara.',
                'color' => '#8B5CF6',
                'sort_order' => 10,
            ],
        ];

        foreach ($items as $item) {
            if (! $item['olimpiade']) {
                continue;
            }

            OlimpiadeSchedule::updateOrCreate(
                [
                    'olimpiade_id' => $item['olimpiade']->id,
                    'title' => $item['title'],
                ],
                [
                    ...collect($item)->except('olimpiade')->all(),
                    'olimpiade_id' => $item['olimpiade']->id,
                    'status' => true,
                ],
            );
        }
    }
}
