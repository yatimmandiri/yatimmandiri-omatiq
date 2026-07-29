<?php

namespace Database\Seeders;

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Models\Core\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ParticipantSeeder extends Seeder
{
    public function run(): void
    {
        $olimpiade = Olimpiade::first();
        $province = Province::where('name', 'like', 'JAWA TIMUR')->first() ?? Province::first();
        $regency = Regency::where('province_id', $province->id)->first();
        $user = User::where('email', 'partisipan@test.dev')->first();
        $teacher = User::where('email', 'guru@test.dev')->first();

        Participant::create([
            'user_id' => $user?->id,
            'nik' => '3525011505120001',
            'registration_number' => 'OMQ-'.now()->format('Ymd').'-0001',
            'registration_type' => 'teacher',
            'mentor_id' => $teacher?->id,
            'olimpiade_id' => $olimpiade?->id ?? 1,
            'full_name' => 'Ahmad Fauzi',
            'nickname' => 'Ahmad',
            'gender' => 'male',
            'birth_place' => 'Surabaya',
            'birth_date' => Carbon::parse('2012-05-15'),
            'age' => 14,
            'education_level' => 'smp',
            'school_name' => 'SMP Negeri 1 Surabaya',
            'grade' => '8',
            'address' => 'Jl. Raya Darmo Permai No. 123, Surabaya',
            'province_id' => $province?->id,
            'regency_id' => $regency?->id,
            'parent_phone' => '081234567890',
            'development_program' => 'sanggar_genius',
            'institution_name' => 'Sanggar Genius Al-Falah',
            'mentor_name' => 'Ustadz Abdul Rahman',
            'mentor_phone' => '081234567891',
            'achievements' => 'Juara 1 Matematika tingkat Kota 2025',
            'has_joined_before' => false,
            'data_truth_consent' => true,
            'documentation_consent' => true,
            'rules_consent' => true,
            'participant_signature_name' => 'Ahmad Fauzi',
            'guardian_signature_name' => 'Budi Santoso',
            'status' => 'verified',
        ]);

        $this->command?->info('Participant dummy created: Ahmad Fauzi (OMQ-'.now()->format('Ymd').'-0001)');
    }
}
