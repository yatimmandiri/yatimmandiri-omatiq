<?php

namespace Database\Factories\Company;

use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class ParticipantFactory extends Factory
{
    protected $model = Participant::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'olimpiade_id' => Olimpiade::factory(),
            'registration_number' => 'OMQ-'.now()->format('Ymd').'-'.str_pad((string) fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'registration_type' => 'public',
            'status' => 'submitted',
            'data_truth_consent' => true,
            'documentation_consent' => true,
            'rules_consent' => true,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'verified']);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'rejected']);
    }
}
