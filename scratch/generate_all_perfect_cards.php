<?php

echo "=== GENERATING PERFECT OFFICIAL CARD TEMPLATES ===\n";

$targetW = 1224;
$targetH = 1932;

function cropAlpha($src)
{
    $w = imagesx($src);
    $h = imagesy($src);
    $minX = $w;
    $maxX = 0;
    $minY = $h;
    $maxY = 0;
    for ($y = 0; $y < $h; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $c = imagecolorat($src, $x, $y);
            $a = ($c >> 24) & 0x7F;
            if ($a < 120) {
                if ($x < $minX) {
                    $minX = $x;
                }
                if ($x > $maxX) {
                    $maxX = $x;
                }
                if ($y < $minY) {
                    $minY = $y;
                }
                if ($y > $maxY) {
                    $maxY = $y;
                }
            }
        }
    }
    $cw = max(1, $maxX - $minX + 1);
    $ch = max(1, $maxY - $minY + 1);
    $dst = imagecreatetruecolor($cw, $ch);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    $trans = imagecolorallocatealpha($dst, 0, 0, 0, 127);
    imagefilledrectangle($dst, 0, 0, $cw, $ch, $trans);
    imagecopy($dst, $src, 0, 0, $minX, $minY, $cw, $ch);

    return $dst;
}

// Load official HD assets
$rawOmatiq = imagecreatefrompng('public/assets/images/icon-omatiq.png');
$cropOmatiq = cropAlpha($rawOmatiq);

$rawYM = imagecreatefrompng('public/assets/images/icon-ym.png');
$cropYM = cropAlpha($rawYM);

$rawTulisan = imagecreatefrompng('public/assets/images/Tulisan Omatiq.png');
$rawTulisanPutih = imagecreatefrompng('public/assets/images/Tulisan Omatiq Putih.png');

$rawZakki = imagecreatefrompng('public/assets/images/Zakki Window Hi.png');
$cropZakki = cropAlpha($rawZakki);

$rawAmila = imagecreatefrompng('public/assets/images/Amila Window Hi.png');
$cropAmila = cropAlpha($rawAmila);

$rawTopMascots = imagecreatefrompng('public/assets/images/Zakki Amila Atas.png');
$cropTopMascots = cropAlpha($rawTopMascots);

$uploadDir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';

function inpaintGradientVertical($im, $x1, $x2, $y1, $y2)
{
    for ($x = $x1; $x <= $x2; $x++) {
        $cTop = imagecolorat($im, $x, $y1);
        $cBot = imagecolorat($im, $x, $y2);
        $rT = ($cTop >> 16) & 0xFF;
        $gT = ($cTop >> 8) & 0xFF;
        $bT = $cTop & 0xFF;
        $rB = ($cBot >> 16) & 0xFF;
        $gB = ($cBot >> 8) & 0xFF;
        $bB = $cBot & 0xFF;
        for ($y = $y1 + 1; $y < $y2; $y++) {
            $t = ($y - $y1) / ($y2 - $y1);
            $r = (int) ($rT + $t * ($rB - $rT));
            $g = (int) ($gT + $t * ($gB - $gT));
            $b = (int) ($bT + $t * ($bB - $bT));
            imagesetpixel($im, $x, $y, imagecolorallocate($im, $r, $g, $b));
        }
    }
}

function stampDualHeaderLogos($im, $cropOmatiq, $cropYM, $targetW, $targetY = 110, $targetH = 115, $gap = 24)
{
    $scaleO = $targetH / imagesy($cropOmatiq);
    $wO = (int) (imagesx($cropOmatiq) * $scaleO);

    $scaleY = $targetH / imagesy($cropYM);
    $wY = (int) (imagesx($cropYM) * $scaleY);

    $totalW = $wO + $gap + $wY;
    $startX = (int) (($targetW - $totalW) / 2);

    imagealphablending($im, true);
    imagecopyresampled($im, $cropOmatiq, $startX, $targetY, 0, 0, $wO, $targetH, imagesx($cropOmatiq), imagesy($cropOmatiq));
    imagecopyresampled($im, $cropYM, $startX + $wO + $gap, $targetY, 0, 0, $wY, $targetH, imagesx($cropYM), imagesy($cropYM));
}

// =========================================================================
// 1. CHAPERONE / PENDAMPING CARDS
// =========================================================================
echo "\n--- Generating Chaperone Cards ---\n";

// A. FRONT
$rawPF = imagecreatefrompng($uploadDir.'media_1794554817846_fe6706b8.png');
$cardChaperoneFront = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($cardChaperoneFront, $rawPF, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawPF), imagesy($rawPF));

// Clear top logo area with clean background cream (#FEFBEE)
for ($y = 100; $y <= 235; $y++) {
    for ($x = 350; $x <= 874; $x++) {
        imagesetpixel($cardChaperoneFront, $x, $y, imagecolorallocate($cardChaperoneFront, 254, 251, 238));
    }
}
stampDualHeaderLogos($cardChaperoneFront, $cropOmatiq, $cropYM, $targetW, 110, 115, 24);

// Clear data box (x: 120..1104, y: 1025..1325) completely of dummy text!
$creamBg = imagecolorallocate($cardChaperoneFront, 254, 251, 236);
imagefilledrectangle($cardChaperoneFront, 120, 1025, 1104, 1325, $creamBg);

imagepng($cardChaperoneFront, 'public/assets/images/cards/card-chaperone-bg-front.png');
echo "Saved: card-chaperone-bg-front.png\n";

// B. BACK
$rawPB = imagecreatefrompng($uploadDir.'media_1794554817867_01639dbf.png');
$cardChaperoneBack = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($cardChaperoneBack, $rawPB, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawPB), imagesy($rawPB));

// Erase dummy QR code and white container from y: 685 to y: 1335
inpaintGradientVertical($cardChaperoneBack, 100, 1124, 685, 1335);

// Stamp HD Zakki and HD Amila
$zScale = 0.35;
$zW = (int) (imagesx($cropZakki) * $zScale);
$zH = (int) (imagesy($cropZakki) * $zScale);
imagecopyresampled($cardChaperoneBack, $cropZakki, 20, 870, 0, 0, $zW, $zH, imagesx($cropZakki), imagesy($cropZakki));

$aScale = 0.35;
$aW = (int) (imagesx($cropAmila) * $aScale);
$aH = (int) (imagesy($cropAmila) * $aScale);
imagecopyresampled($cardChaperoneBack, $cropAmila, 975, 860, 0, 0, $aW, $aH, imagesx($cropAmila), imagesy($cropAmila));

imagepng($cardChaperoneBack, 'public/assets/images/cards/card-chaperone-bg-back.png');
echo "Saved: card-chaperone-bg-back.png (FULL BACKGROUND, NO WHITE CONTAINER)\n";

// =========================================================================
// 2. PARTICIPANT / PESERTA CARDS
// =========================================================================
echo "\n--- Generating Participant Cards ---\n";

// A. FRONT
$rawPesF = imagecreatefrompng($uploadDir.'media_1794554817796_83d00cd5.png');
$cardPesertaFront = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($cardPesertaFront, $rawPesF, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawPesF), imagesy($rawPesF));

// Clear top logo area with white/mint
for ($y = 100; $y <= 235; $y++) {
    for ($x = 350; $x <= 874; $x++) {
        imagesetpixel($cardPesertaFront, $x, $y, imagecolorallocate($cardPesertaFront, 248, 255, 254));
    }
}
stampDualHeaderLogos($cardPesertaFront, $cropOmatiq, $cropYM, $targetW, 110, 115, 24);

// Clear data box (x: 120..1104, y: 1025..1325) completely of dummy text!
$mintBg = imagecolorallocate($cardPesertaFront, 240, 254, 252);
imagefilledrectangle($cardPesertaFront, 120, 1025, 1104, 1325, $mintBg);

imagepng($cardPesertaFront, 'public/assets/images/cards/card-bg-front.png');
echo "Saved: card-bg-front.png\n";

// B. BACK
$rawPesB = imagecreatefrompng($uploadDir.'media_1794554817818_b72dbf2a.png');
$cardPesertaBack = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($cardPesertaBack, $rawPesB, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawPesB), imagesy($rawPesB));

// Erase dummy QR code and white container from y: 685 to y: 1335
inpaintGradientVertical($cardPesertaBack, 100, 1124, 685, 1335);

// Stamp HD Zakki and HD Amila
imagecopyresampled($cardPesertaBack, $cropZakki, 20, 870, 0, 0, $zW, $zH, imagesx($cropZakki), imagesy($cropZakki));
imagecopyresampled($cardPesertaBack, $cropAmila, 975, 860, 0, 0, $aW, $aH, imagesx($cropAmila), imagesy($cropAmila));

imagepng($cardPesertaBack, 'public/assets/images/cards/card-bg-back.png');
echo "Saved: card-bg-back.png (FULL BACKGROUND, NO WHITE CONTAINER)\n";

// =========================================================================
// 3. COMMITTEE / PANITIA CARDS
// =========================================================================
echo "\n--- Generating Committee Cards ---\n";

// A. FRONT
$rawPanF = imagecreatefrompng($uploadDir.'media_1794554817791_1b8f3562.png');
$cardPanitiaFront = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($cardPanitiaFront, $rawPanF, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawPanF), imagesy($rawPanF));

// Clear top logo area with dark teal
for ($y = 100; $y <= 235; $y++) {
    for ($x = 350; $x <= 874; $x++) {
        imagesetpixel($cardPanitiaFront, $x, $y, imagecolorallocate($cardPanitiaFront, 2, 70, 78));
    }
}
stampDualHeaderLogos($cardPanitiaFront, $cropOmatiq, $cropYM, $targetW, 110, 115, 24);

// Clear data box (x: 120..1104, y: 1025..1325) completely of dummy text!
$tealBg = imagecolorallocate($cardPanitiaFront, 0, 109, 102);
imagefilledrectangle($cardPanitiaFront, 120, 1025, 1104, 1325, $tealBg);

imagepng($cardPanitiaFront, 'public/assets/images/cards/card-committee-bg-front.png');
echo "Saved: card-committee-bg-front.png\n";

// B. BACK
$rawPanB = imagecreatefrompng($uploadDir.'media_1794554817858_3ae89431.png');
$cardPanitiaBack = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($cardPanitiaBack, $rawPanB, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawPanB), imagesy($rawPanB));

// Erase dummy QR code and white container from y: 685 to y: 1335
inpaintGradientVertical($cardPanitiaBack, 100, 1124, 685, 1335);

// Stamp HD Zakki and HD Amila
imagecopyresampled($cardPanitiaBack, $cropZakki, 20, 870, 0, 0, $zW, $zH, imagesx($cropZakki), imagesy($cropZakki));
imagecopyresampled($cardPanitiaBack, $cropAmila, 975, 860, 0, 0, $aW, $aH, imagesx($cropAmila), imagesy($cropAmila));

imagepng($cardPanitiaBack, 'public/assets/images/cards/card-committee-bg-back.png');
echo "Saved: card-committee-bg-back.png (FULL BACKGROUND, NO WHITE CONTAINER)\n";

echo "\n=== ALL 6 CARDS SUCCESSFULLY GENERATED ===\n";
