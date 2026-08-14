<?php

namespace Database\Seeders;

use App\Models\Company\Student;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\User;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $mentors = User::role('Teacher')->get();

        if ($mentors->isEmpty()) {
            $this->command?->warn('No teacher users found. Run UserRolePermissionSeeder first.');

            return;
        }

        $province = Province::where('name', 'like', 'JAWA TIMUR')->first() ?? Province::first();
        $regency = $province ? Regency::where('province_id', $province->id)->first() : null;

        $students = [
            [
                'nik' => '3525011505120001',
                'full_name' => 'Ahmad Fauzi',
                'nickname' => 'Ahmad',
                'gender' => 'male',
                'birth_place' => 'Surabaya',
                'birth_date' => '2012-05-15',
                'age' => 14,
                'school_name' => 'SMP Negeri 1 Surabaya',
                'grade' => '8',
                'address' => 'Jl. Raya Darmo Permai No. 123, Surabaya',
                'parent_phone' => '081234567890',
            ],
            [
                'nik' => '3515082107120002',
                'full_name' => 'Siti Aminah',
                'nickname' => 'Siti',
                'gender' => 'female',
                'birth_place' => 'Sidoarjo',
                'birth_date' => '2012-07-21',
                'age' => 14,
                'school_name' => 'SMP Negeri 2 Sidoarjo',
                'grade' => '8',
                'address' => 'Jl. Pahlawan No. 45, Sidoarjo',
                'parent_phone' => '081234567891',
            ],
            [
                'nik' => '3578010301110003',
                'full_name' => 'Muhammad Rizky',
                'nickname' => 'Rizky',
                'gender' => 'male',
                'birth_place' => 'Malang',
                'birth_date' => '2014-11-03',
                'age' => 12,
                'school_name' => 'SDN Kauman 1 Malang',
                'grade' => '6',
                'address' => 'Jl. Merdeka No. 88, Malang',
                'parent_phone' => '081234567892',
            ],
            [
                'nik' => '3525174109130004',
                'full_name' => 'Aisyah Putri',
                'nickname' => 'Aisyah',
                'gender' => 'female',
                'birth_place' => 'Gresik',
                'birth_date' => '2013-03-17',
                'age' => 13,
                'school_name' => 'SMP Muhammadiyah 4 Gresik',
                'grade' => '7',
                'address' => 'Jl. Jend. Ahmad Yani No. 21, Gresik',
                'parent_phone' => '081234567893',
            ],
            [
                'nik' => '3510120209090005',
                'full_name' => 'Fatimah Azzahra',
                'nickname' => 'Fatimah',
                'gender' => 'female',
                'birth_place' => 'Banyuwangi',
                'birth_date' => '2015-09-02',
                'age' => 11,
                'school_name' => 'SD Islam Al-Falah Banyuwangi',
                'grade' => '5',
                'address' => 'Jl. Gajah Mada No. 7, Banyuwangi',
                'parent_phone' => '081234567894',
            ],
        ];

        foreach ($students as $index => $student) {
            $mentor = $mentors[$index % $mentors->count()];

            Student::query()->updateOrCreate(
                ['nik' => $student['nik']],
                [
                    ...$student,
                    'province_id' => $province?->id,
                    'regency_id' => $regency?->id,
                    'mentor_id' => $mentor->id,
                    'mentor_name' => $mentor->name,
                    'is_binaan' => true,
                ],
            );
        }

        $this->command?->info('StudentSeeder: '.count($students).' students seeded and linked to '.$mentors->count().' mentor(s).');
    }
}
