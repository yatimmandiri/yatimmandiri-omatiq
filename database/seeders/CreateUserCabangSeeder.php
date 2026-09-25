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
            'view-participant',
            'data-participant',
            'view-user',
            'data-user',
            'view-student',
            'data-student',
        ]);

        $cabangUsers = [
            'ngawi@yatimmandiri.org' => 'NGAWI',
            'palembang@yatimmandiri.org' => 'PALEMBANG',
            'batam@yatimmandiri.org' => 'BATAM',
            'lampung@yatimmandiri.org' => 'LAMPUNG',
            'tangerang@yatimmandiri.org' => 'TANGERANG',
            'pekalongan@yatimmandiri.org' => 'PEKALONGAN',
            'magetan@yatimmandiri.org' => 'MAGETAN',
            'tulungagung@yatimmandiri.org' => 'TULUNGAGUNG',
            'balikpapan@yatimmandiri.org' => 'BALIKPAPAN',
            'medan@yatimmandiri.org' => 'MEDAN',
            'blitar@yatimmandiri.org' => 'BLITAR',
            'bandung@yatimmandiri.org' => 'BANDUNG',
            'surabaya@yatimmandiri.org' => 'SURABAYA',
            'sragen@yatimmandiri.org' => 'SRAGEN',
            'semarang@yatimmandiri.org' => 'SEMARANG',
            'solo@yatimmandiri.org' => 'SOLO',
            'serang@yatimmandiri.org' => 'SERANG',
            'kediri@yatimmandiri.org' => 'KEDIRI',
            'cirebon@yatimmandiri.org' => 'CIREBON',
            'jombang@yatimmandiri.org' => 'JOMBANG',
            'bogor@yatimmandiri.org' => 'BOGOR',
            'jaktim@yatimmandiri.org' => 'JAKARTA TIMUR',
            'kudus@yatimmandiri.org' => 'KUDUS',
            'nganjuk@yatimmandiri.org' => 'NGANJUK',
            'batu@yatimmandiri.org' => 'BATU',
            'ponorogo@yatimmandiri.org' => 'PONOROGO',
            'lamongan@yatimmandiri.org' => 'LAMONGAN',
            'purwokerto@yatimmandiri.org' => 'PURWOKERTO',
            'mojokerto@yatimmandiri.org' => 'MOJOKERTO',
            'bekasi@yatimmandiri.org' => 'BEKASI',
            'depok@yatimmandiri.org' => 'DEPOK',
            'pasuruan@yatimmandiri.org' => 'PASURUAN',
            'magelang@yatimmandiri.org' => 'MAGELANG',
            'gresik@yatimmandiri.org' => 'GRESIK',
            'malang@yatimmandiri.org' => 'MALANG',
        ];

        foreach ($cabangUsers as $email => $branchName) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => 'Cabang '.$branchName,
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
