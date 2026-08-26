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

        // Binaan pure API: use penyaluran snapshot (matches GET guru/students example)
        Participant::query()->updateOrCreate(
            ['registration_number' => $registrationNumber],
            [
                'user_id' => $user?->id,
                'student_id' => null,
                'penyaluran_student_id' => 2445,
                'penyaluran_student_name' => 'RACHMA TALITA AZALIA',
                'penyaluran_student_nik' => '3404054207160001',
                'nik' => '3404054207160001',
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
