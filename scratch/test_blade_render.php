<?php

use App\Models\Company\EventCommittee;
use App\Services\BarcodeService;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';

$app->make(Kernel::class)->bootstrap();

$committee = new EventCommittee([
    'name' => 'KHOTIB',
    'division' => 'Panitia Pelaksana Babak Final',
    'position' => 'Anggota Panitia',
    'branch' => 'PUSAT 1',
    'registration_number' => 'CREW-00053',
    'is_active' => true,
]);

$barcodeService = app(BarcodeService::class);
$qrCodeSvg = $barcodeService->generateQrCodeSvg('https://omatiq.com/verifikasi/panitia/CREW-00053', 380, '#09767a');

$html = view('cards.committee-card', [
    'committee' => $committee,
    'committeeIdFormatted' => 'CREW-00053',
    'qrCodeSvg' => $qrCodeSvg,
    'isVerified' => true,
    'isPdf' => false,
])->render();

file_put_contents(__DIR__.'/test_committee_rendered.html', $html);
echo 'SUCCESS! Rendered '.strlen($html)." bytes to scratch/test_committee_rendered.html\n";
