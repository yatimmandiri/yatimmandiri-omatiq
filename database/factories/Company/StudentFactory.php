<?php

namespace Database\Factories\Company;

use App\Models\Company\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'nik' => fake()->unique()->numerify(str_repeat('#', 16)),
            'full_name' => fake()->name(),
            'nickname' => fake()->firstName(),
            'gender' => fake()->randomElement(['male', 'female']),
            'birth_place' => fake()->city(),
            'birth_date' => fake()->date('Y-m-d', 'now'),
            'school_name' => fake()->company(),
            'grade' => fake()->randomElement(['I', 'II', 'III', 'IV', 'V', 'VI']),
            'address' => fake()->address(),
            'parent_phone' => fake()->phoneNumber(),
            'is_binaan' => false,
        ];
    }
}
