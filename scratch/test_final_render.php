<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\Company\EventCommittee;
use App\Services\BarcodeService;
use Illuminate\Contracts\Console\Kernel;

$committee = EventCommittee::first();
if (! $committee) {
    $committee = new EventCommittee([
        'code' => 'CREW-00053',
        'name' => 'KHOTIB',
        'division' => 'Panitia Pelaksana Babak Final',
        'position' => 'Anggota Panitia',
        'branch' => 'PUSAT 1',
        'gender' => 'male',
        'event_year' => 2026,
        'status' => 'active',
    ]);
}

$barcodeService = app(BarcodeService::class);
$verifyUrl = route('home.committee.verify', ['code' => $committee->code]);
$isVerified = true;
$qrCodeColor = '#09767a';
$qrCodeSvg = $barcodeService->generateQrCodeSvg($verifyUrl, size: 160, color: $qrCodeColor);
$barcodeSvg = $barcodeService->generateCode128Svg($committee->code, height: 26, barWidth: 1.1, color: $qrCodeColor);

$data = [
    'committee' => $committee,
    'committeeIdFormatted' => $committee->code,
    'verifyUrl' => $verifyUrl,
    'qrCodeSvg' => $qrCodeSvg,
    'barcodeSvg' => $barcodeSvg,
    'isVerified' => $isVerified,
    'isPdf' => false,
];

$html = view('cards.committee-card', $data)->render();
file_put_contents('scratch/final_rendered_committee.html', $html);
echo 'Rendered '.strlen($html)." bytes cleanly!\n";
