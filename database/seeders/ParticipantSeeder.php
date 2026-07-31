<?php

namespace Database\Seeders;

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use App\Models\Core\User;
use Illuminate\Database\Seeder;

class ParticipantSeeder extends Seeder
{
    public function run(): void
    {
        $olimpiade = Olimpiade::first();
        $user = User::where('email', 'partisipan@test.dev')->first();
        $teacher = User::where('email', 'guru@test.dev')->first();
        $student = Student::where('nik', '3525011505120001')->first();

        if (! $student) {
            $this->command?->warn('Student with NIK 3525011505120001 not found. Run StudentSeeder first.');

            return;
        }

        $registrationNumber = 'OMQ-'.now()->format('Ymd').'-0001';

        Participant::query()->updateOrCreate(
            ['registration_number' => $registrationNumber],
            [
                'user_id' => $user?->id,
                'student_id' => $student->id,
                'registration_type' => 'teacher',
                'mentor_id' => $teacher?->id ?? $student->mentor_id,
                'olimpiade_id' => $olimpiade?->id ?? 1,
                'achievements' => 'Juara 1 Matematika tingkat Kota 2025',
                'has_joined_before' => false,
                'data_truth_consent' => true,
                'documentation_consent' => true,
                'rules_consent' => true,
                'participant_signature_name' => $student->full_name,
                'guardian_signature_name' => 'Budi Santoso',
                'status' => 'verified',
            ],
        );

        $this->command?->info('Participant dummy created: '.$student->full_name.' ('.$registrationNumber.')');
    }
}
