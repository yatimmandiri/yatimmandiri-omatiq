<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\Company\Student;
use App\Models\Core\User;
use App\Services\PenyaluranService;
use Illuminate\Contracts\Console\Kernel;

$phone = '081224740289';
$user = User::where('phone', $phone)->orWhere('phone', '6281224740289')->first();

echo "Local User in OMATIQ:\n";
if ($user) {
    echo "ID: {$user->id}\n";
    echo "Name: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Penyaluran ID: {$user->penyaluran_id}\n";
    echo 'Penyaluran Token: '.substr($user->penyaluran_token ?? '', 0, 20)."...\n";
    echo "Branch: {$user->branch}\n";
} else {
    echo "User not found in local DB!\n";
}

$localStudents = Student::where('mentor_id', $user?->id)->get();
echo "\nLocal Students with mentor_id = {$user?->id}: ".$localStudents->count()."\n";
foreach ($localStudents as $s) {
    echo " - [Local ID: {$s->id}, Penyaluran ID: {$s->penyaluran_id}] {$s->full_name} (NIK: {$s->nik}, mentor_id: {$s->mentor_id})\n";
}

$penyaluran = app(PenyaluranService::class);
$token = $penyaluran->loginGuru($phone);
$me = $penyaluran->me($token);
$apiStudents = $penyaluran->students($token);

echo "\nAPI Penyaluran Students for this phone ({$phone}): ".count($apiStudents)."\n";
foreach (array_slice($apiStudents, 0, 5) as $s) {
    $sid = $s['student_id'] ?? $s['id'];
    $localMatch = Student::where('penyaluran_id', $sid)->first();
    echo " - [API ID: {$sid}] {$s['name']} (NIK: {$s['nik']}) -> Local Student DB: ".($localMatch ? "Found ID {$localMatch->id} (mentor_id: {$localMatch->mentor_id})" : 'NOT IN LOCAL DB')."\n";
}
