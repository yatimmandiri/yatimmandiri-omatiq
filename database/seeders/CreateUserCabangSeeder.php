<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CreateUserCabangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       <?php

namespace Database\Seeders;

use App\Models\Core\Role;
use App\Models\Core\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CreateUserCabangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cabangRole = Role::firstOrCreate(['name' => 'Cabang', 'guard_name' => 'web']);

        $cabangRole->givePermissionTo([
            'view-participant', 'data-participant',
            'view-user', 'data-user',
            'view-student', 'data-student',
        ]);

        $cabangUsers = [
            'ngawi@yatimmandiri.org' => 'Ngawi',
            'palembang@yatimmandiri.org' => 'Palembang',
            'batam@yatimmandiri.org' => 'Batam',
            'lampung@yatimmandiri.org' => 'Lampung',
            'tangerang@yatimmandiri.org' => 'Tangerang',
            'pekalongan@yatimmandiri.org' => 'Pekalongan',
            'magetan@yatimmandiri.org' => 'Magetan',
            'tulungagung@yatimmandiri.org' => 'Tulungagung',
            'balikpapan@yatimmandiri.org' => 'Balikpapan',
            'medan@yatimmandiri.org' => 'Medan',
            'blitar@yatimmandiri.org' => 'Blitar',
            'bandung@yatimmandiri.org' => 'Bandung',
            'surabaya@yatimmandiri.org' => 'Surabaya',
            'sragen@yatimmandiri.org' => 'Sragen',
            'semarang@yatimmandiri.org' => 'Semarang',
            'solo@yatimmandiri.org' => 'Solo',
            'serang@yatimmandiri.org' => 'Serang',
            'kediri@yatimmandiri.org' => 'Kediri',
            'cirebon@yatimmandiri.org' => 'Cirebon',
            'jombang@yatimmandiri.org' => 'Jombang',
            'bogor@yatimmandiri.org' => 'Bogor',
            'jaktim@yatimmandiri.org' => 'Jakarta Timur',
            'kudus@yatimmandiri.org' => 'Kudus',
            'nganjuk@yatimmandiri.org' => 'Nganjuk',
            'batu@yatimmandiri.org' => 'Batu',
            'ponorogo@yatimmandiri.org' => 'Ponorogo',
            'lamongan@yatimmandiri.org' => 'Lamongan',
        ];

        foreach ($cabangUsers as $email => $branchName) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => 'Cabang ' . $branchName,
                    'branch' => $branchName,
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                ]
            );

            if (! $user->hasRole('Cabang')) {
                $user->assignRole('Cabang');
            }
        }
    }
}
