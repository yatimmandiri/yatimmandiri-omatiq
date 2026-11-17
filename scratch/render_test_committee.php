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
    echo "No committee found, creating dummy...\n";
    $committee = new EventCommittee([
        'code' => 'CREW-00053',
        'name' => 'Khotib',
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

// Temporarily copy our test images to public/assets/images/cards/
copy('scratch/test_panitia_front.png', 'public/assets/images/cards/card-committee-bg-front.png');
copy('scratch/test_panitia_back.png', 'public/assets/images/cards/card-committee-bg-back.png');

$html = view('cards.committee-card', $data)->render();
file_put_contents('scratch/test_committee_rendered.html', $html);
echo 'Rendered HTML saved to scratch/test_committee_rendered.html ('.strlen($html)." bytes)\n";
