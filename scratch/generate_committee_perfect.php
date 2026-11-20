<?php

$targetW = 1224;
$targetH = 1932;

$uploadDir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';

function cropAlpha($src)
{
    $w = imagesx($src);
    $h = imagesy($src);
    $minX = $w;
    $minY = $h;
    $maxX = 0;
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
    if ($minX > $maxX || $minY > $maxY) {
        return $src;
    }

    $cw = $maxX - $minX + 1;
    $ch = $maxY - $minY + 1;
    $dst = imagecreatetruecolor($cw, $ch);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    $trans = imagecolorallocatealpha($dst, 0, 0, 0, 127);
    imagefilledrectangle($dst, 0, 0, $cw, $ch, $trans);
    imagecopy($dst, $src, 0, 0, $minX, $minY, $cw, $ch);

    return $dst;
}

// Load HD assets
$rawOmatiq = imagecreatefrompng('public/assets/images/icon-omatiq.png');
$cropOmatiq = cropAlpha($rawOmatiq);

$rawYM = imagecreatefrompng('public/assets/images/icon-ym.png');
$cropYM = cropAlpha($rawYM);

$rawZakki = imagecreatefrompng('public/assets/images/Zakki Window Hi.png');
$cropZakki = cropAlpha($rawZakki);

$rawAmila = imagecreatefrompng('public/assets/images/Amila Window Hi.png');
$cropAmila = cropAlpha($rawAmila);

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
// 1. PANITIA FRONT (media_1794554817858_3ae89431.png)
// =========================================================================
echo "Building Panitia FRONT...\n";
$rawPanF = imagecreatefrompng($uploadDir.'media_1794554817858_3ae89431.png');
$cardPanitiaFront = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($cardPanitiaFront, $rawPanF, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawPanF), imagesy($rawPanF));

// A. Clean the single old YM logo at header (y: 95..240, x: 340..884)
for ($y = 95; $y <= 240; $y++) {
    $cL = imagecolorat($cardPanitiaFront, 340, $y);
    $cR = imagecolorat($cardPanitiaFront, 884, $y);
    $rL = ($cL >> 16) & 0xFF;
    $gL = ($cL >> 8) & 0xFF;
    $bL = $cL & 0xFF;
    $rR = ($cR >> 16) & 0xFF;
    $gR = ($cR >> 8) & 0xFF;
    $bR = $cR & 0xFF;

    for ($x = 341; $x <= 883; $x++) {
        $t = ($x - 340) / (884 - 340);
        $r = (int) ($rL + $t * ($rR - $rL));
        $g = (int) ($gL + $t * ($gR - $gL));
        $b = (int) ($bL + $t * ($bR - $bL));
        imagesetpixel($cardPanitiaFront, $x, $y, imagecolorallocate($cardPanitiaFront, $r, $g, $b));
    }
}

// B. Stamp HD dual logos
stampDualHeaderLogos($cardPanitiaFront, $cropOmatiq, $cropYM, $targetW, 110, 115, 24);

// C. Clean data box (x: 125..1100, y: 1025..1325)
for ($x = 125; $x <= 1100; $x++) {
    $cTop = imagecolorat($cardPanitiaFront, $x, 1025);
    $cBot = imagecolorat($cardPanitiaFront, $x, 1325);
    $rT = ($cTop >> 16) & 0xFF;
    $gT = ($cTop >> 8) & 0xFF;
    $bT = $cTop & 0xFF;
    $rB = ($cBot >> 16) & 0xFF;
    $gB = ($cBot >> 8) & 0xFF;
    $bB = $cBot & 0xFF;

    for ($y = 1026; $y < 1325; $y++) {
        $t = ($y - 1025) / (1325 - 1025);
        $r = (int) ($rT + $t * ($rB - $rT));
        $g = (int) ($gT + $t * ($gB - $gT));
        $b = (int) ($bT + $t * ($bB - $bT));
        imagesetpixel($cardPanitiaFront, $x, $y, imagecolorallocate($cardPanitiaFront, $r, $g, $b));
    }
}

imagepng($cardPanitiaFront, 'public/assets/images/cards/card-committee-bg-front.png');
echo "Successfully saved: public/assets/images/cards/card-committee-bg-front.png\n";

// =========================================================================
// 2. PANITIA BACK (media_1794554817791_1b8f3562.png)
// =========================================================================
echo "Building Panitia BACK...\n";
$rawPanB = imagecreatefrompng($uploadDir.'media_1794554817791_1b8f3562.png');
$cardPanitiaBack = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($cardPanitiaBack, $rawPanB, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawPanB), imagesy($rawPanB));

// Erase dummy QR code and white container from y: 715 to y: 1380, x: 80 to 1144
for ($x = 80; $x <= 1144; $x++) {
    $cTop = imagecolorat($cardPanitiaBack, $x, 715);
    $cBot = imagecolorat($cardPanitiaBack, $x, 1380);
    $rT = ($cTop >> 16) & 0xFF;
    $gT = ($cTop >> 8) & 0xFF;
    $bT = $cTop & 0xFF;
    $rB = ($cBot >> 16) & 0xFF;
    $gB = ($cBot >> 8) & 0xFF;
    $bB = $cBot & 0xFF;

    for ($y = 716; $y < 1380; $y++) {
        $t = ($y - 715) / (1380 - 715);
        $r = (int) ($rT + $t * ($rB - $rT));
        $g = (int) ($gT + $t * ($gB - $gT));
        $b = (int) ($bT + $t * ($bB - $bT));
        imagesetpixel($cardPanitiaBack, $x, $y, imagecolorallocate($cardPanitiaBack, $r, $g, $b));
    }
}

// Stamp HD Zakki and HD Amila
$zScale = 0.35;
$zW = (int) (imagesx($cropZakki) * $zScale);
$zH = (int) (imagesy($cropZakki) * $zScale);
imagecopyresampled($cardPanitiaBack, $cropZakki, 20, 870, 0, 0, $zW, $zH, imagesx($cropZakki), imagesy($cropZakki));

$aScale = 0.35;
$aW = (int) (imagesx($cropAmila) * $aScale);
$aH = (int) (imagesy($cropAmila) * $aScale);
imagecopyresampled($cardPanitiaBack, $cropAmila, 975, 860, 0, 0, $aW, $aH, imagesx($cropAmila), imagesy($cropAmila));

imagepng($cardPanitiaBack, 'public/assets/images/cards/card-committee-bg-back.png');
echo "Successfully saved: public/assets/images/cards/card-committee-bg-back.png\n";

echo "DONE!\n";
