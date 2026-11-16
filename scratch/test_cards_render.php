<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\Company\EventCommittee;
use App\Models\Company\NationalChaperone;
use App\Models\Company\Participant;
use App\Services\BarcodeService;
use Illuminate\Contracts\Console\Kernel;

$barcodeService = app(BarcodeService::class);

echo "=== Testing Chaperone Card Render ===\n";
$chaperone = NationalChaperone::first();
if ($chaperone) {
    $qrCodeSvg = $barcodeService->generateQrCodeSvg('TEST-CHAPERONE-001', 140, '#7A6400');
    $html = view('cards.chaperone-card', [
        'chaperone' => $chaperone,
        'chaperoneIdFormatted' => 'CP OFF - 0001A',
        'qrCodeSvg' => $qrCodeSvg,
        'isVerified' => true,
        'isPdf' => false,
    ])->render();
    echo 'Chaperone Card rendered successfully: '.strlen($html)." bytes\n";
} else {
    echo "No chaperone found in DB, skipping live chaperone test\n";
}

echo "=== Testing Participant Card Render ===\n";
$participant = Participant::first();
if ($participant) {
    $qrCodeSvg = $barcodeService->generateQrCodeSvg('TEST-PARTICIPANT-001', 140, '#09767A');
    $html = view('cards.participant-card', [
        'participant' => $participant,
        'barcode1D' => $barcodeService->generateCode128Svg('2026-OMATIQ-001', 40, 1.3, '#09767A'),
        'qrCodeSvg' => $qrCodeSvg,
        'status' => 'verified',
        'isPdf' => false,
    ])->render();
    echo 'Participant Card rendered successfully: '.strlen($html)." bytes\n";
} else {
    echo "No participant found in DB, skipping live participant test\n";
}

echo "=== Testing Committee Card Render ===\n";
$committee = EventCommittee::first();
if ($committee) {
    $qrCodeSvg = $barcodeService->generateQrCodeSvg('TEST-COMMITTEE-001', 140, '#042F2E');
    $html = view('cards.committee-card', [
        'committee' => $committee,
        'committeeIdFormatted' => 'PAN-0001',
        'qrCodeSvg' => $qrCodeSvg,
        'isVerified' => true,
        'isPdf' => false,
    ])->render();
    echo 'Committee Card rendered successfully: '.strlen($html)." bytes\n";
} else {
    echo "No committee found in DB, skipping live committee test\n";
}
