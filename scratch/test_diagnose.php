<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Services\PenyaluranService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Http;

$penyaluran = app(PenyaluranService::class);
$phone = '081224740289';

echo "1. Login Guru: {$phone}\n";
try {
    $token = $penyaluran->loginGuru($phone);
    echo '   Token: '.substr($token, 0, 20)."...\n";
} catch (Throwable $e) {
    echo '   Login error: '.$e->getMessage()."\n";
    exit(1);
}

echo "2. Me profile:\n";
try {
    $me = $penyaluran->me($token);
    echo '   ID: '.($me['id'] ?? $me['teacher_id'] ?? 'null')."\n";
    echo '   Name: '.($me['name'] ?? 'null')."\n";
    echo '   Kantor: '.($me['kantor_name'] ?? 'null')."\n";
    echo '   Sanggars in me: '.count($me['sanggars'] ?? [])."\n";
    echo '   Students in me: '.count($me['students'] ?? [])."\n";
} catch (Throwable $e) {
    echo '   Me error: '.$e->getMessage()."\n";
}

$firstStudent = $me['students'][0] ?? null;
if ($firstStudent) {
    $studentId = $firstStudent['id'] ?? $firstStudent['student_id'];
    echo "\n3. First student ID: {$studentId}, Name: {$firstStudent['name']}\n";
    echo "   Raw student data in Me:\n";
    print_r($firstStudent);

    echo "\n4. Test PUT api/v1/guru/students/{$studentId} using Guru Token (dry-run same data):\n";
    $payload = $penyaluran->formatStudentPayload([
        'full_name' => $firstStudent['name'] ?? 'Test',
        'nik' => $firstStudent['nik'] ?? '3203016309180004',
        'school_name' => $firstStudent['school_name'] ?? 'SD',
        'grade' => $firstStudent['class'] ?? '1',
        'address' => $firstStudent['address'] ?? 'Cianjur',
    ]);

    $response = Http::baseUrl($penyaluran->baseUrl())
        ->acceptJson()
        ->withToken($token)
        ->put("api/v1/guru/students/{$studentId}", $payload);

    echo '   Status: '.$response->status()."\n";
    echo '   Body: '.$response->body()."\n";
}
