<?php

namespace Database\Seeders;

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Core\User;
use Illuminate\Database\Seeder;

class ParticipantSeeder extends Seeder
{
    public function run(): void
    {
        $olimpiade = Olimpiade::first();
        $user = User::where('email', 'partisipan@test.dev')->first();
        $teacher = User::where('email', 'guru@test.dev')->first() ?? User::role('Teacher')->first();

        $registrationNumber = 'OMQ-'.now()->format('Ymd').'-0001';

        $student = \App\Models\Company\Student::firstOrCreate(
            ['penyaluran_id' => 2445],
            [
                'nik' => '3404054207160001',
                'full_name' => 'RACHMA TALITA AZALIA',
                'gender' => 'female',
                'birth_date' => '2016-04-07',
                'school_name' => 'SDN SOMPOKAN',
                'grade' => 'II',
                'nis' => '12345',
                'address' => 'Jl. Contoh No. 1',
                'province_id' => '35',
                'regency_id' => '3578',
                'is_binaan' => true,
                'mentor_id' => $teacher?->id,
            ]
        );

        Participant::query()->updateOrCreate(
            ['registration_number' => $registrationNumber],
            [
                'user_id' => $user?->id,
                'student_id' => $student->id,
                'penyaluran_sanggar_name' => 'SANGGAR GENIUS SOMPOKAN',
                'registration_type' => 'teacher',
                'mentor_id' => $teacher?->id,
                'olimpiade_id' => $olimpiade?->id ?? 1,
                'achievements' => 'Juara 1 Matematika tingkat Kota 2025',
                'has_joined_before' => false,
                'data_truth_consent' => true,
                'documentation_consent' => true,
                'rules_consent' => true,
                'participant_signature_name' => 'RACHMA TALITA AZALIA',
                'guardian_signature_name' => 'Budi Santoso',
                'status' => 'verified',
            ],
        );

        $this->command?->info('Participant dummy created: RACHMA TALITA AZALIA ('.$registrationNumber.')');
    }
}
