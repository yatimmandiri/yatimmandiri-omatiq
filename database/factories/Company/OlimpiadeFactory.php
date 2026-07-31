<?php

namespace Database\Factories\Company;

use App\Models\Company\Olimpiade;
use Illuminate\Database\Eloquent\Factories\Factory;

class OlimpiadeFactory extends Factory
{
    protected $model = Olimpiade::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'category' => fake()->randomElement(['Matematika', 'IPA', 'IPS', 'Bahasa Indonesia']),
            'status' => true,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
