<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            IndoRegionSeeder::class,
            UserRolePermissionSeeder::class,
            OlimpiadeSeeder::class,
            SliderSeeder::class,
            FaqCompanySeeder::class,
            OlimpiadeScheduleSeeder::class,
            TestimonialSeeder::class,
        ]);
    }
}
