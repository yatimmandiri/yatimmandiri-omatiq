<?php

use App\Models\Company\EventCommittee;
use App\Services\BarcodeService;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$committee = new EventCommittee([
    'name' => 'Alfia Rahma',
    'division' => 'Panitia Pelaksana',
    'position' => 'Anggota Panitia',
    'branch' => '',
    'registration_number' => 'CREW-00053',
    'is_active' => true,
]);

$barcodeService = app(BarcodeService::class);
$qrCodeSvg = $barcodeService->generateQrCodeSvg('https://omatiq.com/verifikasi/panitia/CREW-00053', 380, '#09767a');

echo "Setup ready for testing.\n";
