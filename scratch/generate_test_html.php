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

// Write test HTML
ob_start();
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { background: #0f172a; padding: 40px; display: flex; gap: 40px; justify-content: center; font-family: 'Segoe UI', sans-serif; }
.card { width: 372px; height: 590px; border-radius: 20px; overflow: hidden; position: relative; background: url('/assets/images/bg-panitia.png') center/cover no-repeat; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

/* FRONT */
.front-header-logos { position: absolute; top: 22px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 10px; z-index: 5; }
.front-header-logos img { height: 32px; width: auto; object-fit: contain; }

.front-badge-pill { position: absolute; top: 62px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #09767a 0%, #0d9488 100%); color: #ffffff; font-size: 10.5px; font-weight: 900; letter-spacing: 1.5px; padding: 4px 18px; border-radius: 20px; border: 1.5px solid rgba(255,255,255,0.45); box-shadow: 0 4px 12px rgba(9,118,122,0.4); text-transform: uppercase; z-index: 5; }

.front-title-img { position: absolute; top: 92px; left: 50%; transform: translateX(-50%); max-width: 250px; height: auto; z-index: 5; }

.front-mascots-peeking { position: absolute; top: 165px; left: 50%; transform: translateX(-50%); width: 135px; height: auto; z-index: 6; pointer-events: none; }

.front-content-box { position: absolute; top: 215px; left: 50%; transform: translateX(-50%); width: 88%; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1.5px solid rgba(255, 255, 255, 0.4); border-radius: 20px; padding: 16px 14px 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.6); z-index: 5; text-align: center; }

.c-name { font-size: 21px; font-weight: 900; color: #042f2e; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 4px; }
.c-meta { font-size: 11px; font-weight: 700; color: #065f46; line-height: 1.3; }
.c-branch { font-size: 11.5px; font-weight: 800; color: #0f766e; margin-top: 2px; }
.c-id { font-size: 10.5px; font-weight: 800; color: #0d9488; font-family: monospace; letter-spacing: 1.5px; margin-top: 4px; }

.c-divider { width: 80%; height: 1px; background: rgba(255,255,255,0.4); margin: 10px auto 8px; }

.sponsors-wrap { display: flex; flex-direction: column; align-items: center; }
.s-label { font-size: 8px; font-weight: 800; color: #042f2e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; opacity: 0.85; }
.s-row1 { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px; }
.s-row1 img { max-height: 14px; max-width: 52px; width: auto; object-fit: contain; }
.s-row2 { display: flex; align-items: center; justify-content: center; gap: 7px; }
.s-row2 img { max-height: 13px; max-width: 40px; width: auto; object-fit: contain; }

/* BACK */
.back-title-img { position: absolute; top: 32px; left: 50%; transform: translateX(-50%); max-width: 250px; height: auto; z-index: 5; }

.back-mascot-zakki { position: absolute; bottom: 85px; left: -8px; width: 112px; height: auto; z-index: 4; pointer-events: none; }
.back-mascot-amila { position: absolute; bottom: 85px; right: -8px; width: 112px; height: auto; z-index: 4; pointer-events: none; }

.back-qr-box { position: absolute; top: 185px; left: 50%; transform: translateX(-50%); width: 170px; height: 170px; z-index: 5; background: #ffffff; border-radius: 18px; padding: 6px; box-shadow: 0 10px 30px rgba(4,47,46,0.3); display: flex; align-items: center; justify-content: center; }
.back-qr-box svg { width: 100% !important; height: 100% !important; display: block; }

.back-web-url { position: absolute; bottom: 42px; left: 50%; transform: translateX(-50%); color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 6px rgba(0,0,0,0.4); }
</style>
</head>
<body>

<!-- FRONT CARD -->
<div class="card">
    <div class="front-header-logos">
        <img src="/assets/images/icon-omatiq.png" alt="OMATIQ">
        <img src="/assets/images/icon-ym.png" alt="Yatim Mandiri">
    </div>

    <div class="front-badge-pill">PANITIA</div>

    <img src="/assets/images/Tulisan Omatiq Putih.png" class="front-title-img" alt="OMATIQ 2026">

    <img src="/assets/images/Zakki Amila Atas.png" class="front-mascots-peeking" alt="Zakki & Amila">

    <div class="front-content-box">
        <div class="c-name">{{ $committee->name }}</div>
        <div class="c-meta">{{ $committee->position ?: 'Panitia Pelaksana' }} • {{ $committee->division }}</div>
        @if($committee->branch)
        <div class="c-branch">{{ $committee->branch }}</div>
        @endif
        <div class="c-id">{{ $committee->code }}</div>

        <div class="c-divider"></div>

        <div class="sponsors-wrap">
            <div class="s-label">Supported by:</div>
            <div class="s-row1">
                <img src="/assets/images/sponsor/telkomsel.png" alt="Telkomsel">
                <img src="/assets/images/sponsor/telkom.png" alt="Telkom Indonesia">
                <img src="/assets/images/sponsor/chickin.png" alt="Chickin">
                <img src="/assets/images/sponsor/bankaltimtara.png" alt="bankaltimtara">
            </div>
            <div class="s-row2">
                <img src="/assets/images/sponsor/bankbjb.png" alt="bank bjb">
                <img src="/assets/images/sponsor/ybmpln.png" alt="YBM PLN">
                <img src="/assets/images/sponsor/nurulhidayah.png" alt="Nurul Hidayah">
                <img src="/assets/images/sponsor/linkaja.png" alt="LinkAja">
                <img src="/assets/images/sponsor/linkaja-syariah.png" alt="LinkAja Syariah">
            </div>
        </div>
    </div>
</div>

<!-- BACK CARD -->
<div class="card">
    <img src="/assets/images/Tulisan Omatiq Putih.png" class="back-title-img" alt="OMATIQ 2026">

    <img src="/assets/images/Zakki Window Hi.png" class="back-mascot-zakki" alt="Zakki">
    <img src="/assets/images/Amila Window Hi.png" class="back-mascot-amila" alt="Amila">

    <div class="back-qr-box">
        {!! $qrCodeSvg !!}
    </div>

    <div class="back-web-url">www.omatiq.com</div>
</div>

</body>
</html>
<?php
$html = ob_get_clean();
file_put_contents('scratch/test_committee_preview.html', $html);
echo 'Saved scratch/test_committee_preview.html ('.strlen($html)." bytes)\n";
