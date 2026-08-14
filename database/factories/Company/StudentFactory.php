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
            'age' => fake()->numberBetween(6, 18),
            'school_name' => fake()->company(),
            'grade' => fake()->randomElement(['1', '2', '3', '4', '5', '6', '7', '8', '9']),
            'address' => fake()->address(),
            'parent_phone' => fake()->phoneNumber(),
            'is_binaan' => false,
        ];
    }
}
