<?php

namespace Database\Seeders;

use App\Models\Company\Period;
use Illuminate\Database\Seeder;

class PeriodSeeder extends Seeder
{
    public function run(): void
    {
        $periods = [
            [
                'name' => 'OMATIQ 2024',
                'year' => 2024,
                'is_active' => false,
                'description' => 'Periode Olimpiade Matematika dan Al-Qur\'an Tahun 2024',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
            ],
            [
                'name' => 'OMATIQ 2025',
                'year' => 2025,
                'is_active' => false,
                'description' => 'Periode Olimpiade Matematika dan Al-Qur\'an Tahun 2025',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
            ],
            [
                'name' => 'OMATIQ 2026',
                'year' => 2026,
                'is_active' => true,
                'description' => 'Periode Olimpiade Matematika dan Al-Qur\'an Tahun 2026',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
            ],
            [
                'name' => 'OMATIQ 2027',
                'year' => 2027,
                'is_active' => false,
                'description' => 'Periode Olimpiade Matematika dan Al-Qur\'an Tahun 2027',
                'start_date' => '2027-01-01',
                'end_date' => '2027-12-31',
            ],
        ];

        foreach ($periods as $period) {
            Period::query()->updateOrCreate(
                ['year' => $period['year']],
                $period,
            );
        }
    }
}
