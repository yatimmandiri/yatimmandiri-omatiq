<?php

namespace Database\Factories\Company;

use App\Models\Company\Participant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ParticipantFactory extends Factory
{
    protected $model = Participant::class;

    public function definition(): array
    {
        return [
            'registration_number' => 'OMQ-'.now()->format('Ymd').'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'full_name' => fake()->name(),
            'nickname' => fake()->firstName(),
            'gender' => fake()->randomElement(['male', 'female']),
            'birth_place' => fake()->city(),
            'birth_date' => fake()->date(),
            'age' => fake()->numberBetween(6, 18),
            'education_level' => fake()->randomElement(['SD/MI', 'SMP/MTs']),
            'school_name' => fake()->company(),
            'grade' => fake()->randomElement(['1', '2', '3', '4', '5', '6']),
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
