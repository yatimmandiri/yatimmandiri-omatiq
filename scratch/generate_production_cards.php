<?php

$rawFrontPath = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798593_73231e09.png';
$rawBackPath = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798570_9e7d3f1e.png';

$hdTulisanPath = 'public/assets/images/Tulisan Omatiq.png';
$hdZakkiBackPath = 'public/assets/images/Zakki Window Hi.png';
$hdAmilaBackPath = 'public/assets/images/Amila Window Hi.png';
$hdZakkiAmilaTop = 'public/assets/images/Zakki Amila Atas.png';

$outFrontPath = 'public/assets/images/cards/card-bg-front.png';
$outBackPath = 'public/assets/images/cards/card-bg-back.png';

$targetW = 1224;
$targetH = 1944;

echo "=== GENERATING OFFICIAL PRODUCTION CARD BACKGROUNDS ===\n";

function cropToNonTransparent($src)
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

function fillRoundedRect($im, $x1, $y1, $x2, $y2, $radius, $color)
{
    imagefilledrectangle($im, $x1 + $radius, $y1, $x2 - $radius, $y2, $color);
    imagefilledrectangle($im, $x1, $y1 + $radius, $x2, $y2 - $radius, $color);
    imagefilledellipse($im, $x1 + $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x2 - $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x1 + $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x2 - $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
}

function inpaintVertical($im, $xStart, $xEnd, $yStart, $yEnd)
{
    for ($x = $xStart; $x <= $xEnd; $x++) {
        $cTop = imagecolorat($im, $x, $yStart);
        $cBot = imagecolorat($im, $x, $yEnd);

        $rT = ($cTop >> 16) & 0xFF;
        $gT = ($cTop >> 8) & 0xFF;
        $bT = $cTop & 0xFF;
        $rB = ($cBot >> 16) & 0xFF;
        $gB = ($cBot >> 8) & 0xFF;
        $bB = $cBot & 0xFF;

        for ($y = $yStart + 1; $y < $yEnd; $y++) {
            $t = ($y - $yStart) / ($yEnd - $yStart);
            $r = (int) ($rT + $t * ($rB - $rT));
            $g = (int) ($gT + $t * ($gB - $gT));
            $b = (int) ($bT + $t * ($bB - $bT));
            imagesetpixel($im, $x, $y, imagecolorallocate($im, $r, $g, $b));
        }
    }
}

function stripBlackBorders($im, $w, $h)
{
    for ($y = 0; $y < 6; $y++) {
        for ($x = 0; $x < $w; $x++) {
            imagesetpixel($im, $x, $y, imagecolorat($im, $x, 6));
        }
    }
    for ($y = 1938; $y < $h; $y++) {
        for ($x = 0; $x < $w; $x++) {
            imagesetpixel($im, $x, $y, imagecolorat($im, $x, 1937));
        }
    }
}

// -------------------------------------------------------------
// 1. GENERATE CARD-BG-BACK.PNG
// -------------------------------------------------------------
echo "1. Generating card-bg-back.png...\n";
$rawB = imagecreatefrompng($rawBackPath);
$bgBack = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($bgBack, $rawB, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawB), imagesy($rawB));

// Erase old title area with vertical card gradient
for ($y = 270; $y <= 560; $y++) {
    $cL = imagecolorat($bgBack, 70, $y);
    $cR = imagecolorat($bgBack, 1150, $y);
    $rL = ($cL >> 16) & 0xFF;
    $gL = ($cL >> 8) & 0xFF;
    $bL = $cL & 0xFF;
    $rR = ($cR >> 16) & 0xFF;
    $gR = ($cR >> 8) & 0xFF;
    $bR = $cR & 0xFF;

    for ($x = 90; $x <= 1134; $x++) {
        $t = ($x - 90) / (1134 - 90);
        $r = (int) ($rL + $t * ($rR - $rL));
        $g = (int) ($gL + $t * ($gR - $gL));
        $b = (int) ($bL + $t * ($bR - $bL));
        imagesetpixel($bgBack, $x, $y, imagecolorallocate($bgBack, $r, $g, $b));
    }
}

// Stamp HD Tulisan Omatiq
$hdTulisan = imagecreatefrompng($hdTulisanPath);
$tulisanW = 950;
$tulisanH = (int) (imagesy($hdTulisan) * ($tulisanW / imagesx($hdTulisan)));
$tulisanX = (int) (($targetW - $tulisanW) / 2);
$tulisanY = 295;
imagecopyresampled($bgBack, $hdTulisan, $tulisanX, $tulisanY, 0, 0, $tulisanW, $tulisanH, imagesx($hdTulisan), imagesy($hdTulisan));

// Erase old Zakki (left: x=0..390, y=750..1620)
for ($y = 750; $y <= 1620; $y++) {
    $tY = ($y - 750) / (1620 - 750);
    $r = (int) (225 + $tY * (223 - 225));
    $g = (int) (255 + $tY * (241 - 255));
    $b = (int) (250 + $tY * (241 - 250));
    $col = imagecolorallocate($bgBack, $r, $g, $b);
    for ($x = 0; $x <= 390; $x++) {
        imagesetpixel($bgBack, $x, $y, $col);
    }
}

// Erase old Amila (right: x=830..1224, y=750..1650)
for ($y = 750; $y <= 1650; $y++) {
    $tY = ($y - 750) / (1650 - 750);
    $r = (int) (225 + $tY * (225 - 225));
    $g = (int) (255 + $tY * (241 - 255));
    $b = (int) (250 + $tY * (241 - 250));
    $col = imagecolorallocate($bgBack, $r, $g, $b);
    for ($x = 830; $x < $targetW; $x++) {
        imagesetpixel($bgBack, $x, $y, $col);
    }
}

// Inpaint www.omatiq.com on Back Card (x=465..750, y=1480..1530)
inpaintVertical($bgBack, 465, 750, 1480, 1530);

// Crop and Stamp HD Zakki on Left
$rawZakki = imagecreatefrompng($hdZakkiBackPath);
$cropZakki = cropToNonTransparent($rawZakki);
$zScale = 0.35;
$zW = (int) (imagesx($cropZakki) * $zScale);
$zH = (int) (imagesy($cropZakki) * $zScale);
$zX = 20;
$zY = 870;
imagecopyresampled($bgBack, $cropZakki, $zX, $zY, 0, 0, $zW, $zH, imagesx($cropZakki), imagesy($cropZakki));

// Crop and Stamp HD Amila on Right
$rawAmila = imagecreatefrompng($hdAmilaBackPath);
$cropAmila = cropToNonTransparent($rawAmila);
$aScale = 0.35;
$aW = (int) (imagesx($cropAmila) * $aScale);
$aH = (int) (imagesy($cropAmila) * $aScale);
$aX = 975;
$aY = 860;
imagecopyresampled($bgBack, $cropAmila, $aX, $aY, 0, 0, $aW, $aH, imagesx($cropAmila), imagesy($cropAmila));

// Draw White Rounded QR Box on Top (x=261..960, y=696..1332, radius=45)
$white = imagecolorallocate($bgBack, 255, 255, 255);
fillRoundedRect($bgBack, 261, 696, 960, 1332, 45, $white);

stripBlackBorders($bgBack, $targetW, $targetH);
imagepng($bgBack, $outBackPath);
echo "Saved: $outBackPath\n";

// -------------------------------------------------------------
// 2. GENERATE CARD-BG-FRONT.PNG
// -------------------------------------------------------------
echo "2. Generating card-bg-front.png...\n";
$rawF = imagecreatefrompng($rawFrontPath);
$bgFront = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($bgFront, $rawF, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawF), imagesy($rawF));

// Erase old title area on Front with vertical card gradient
for ($y = 530; $y <= 820; $y++) {
    $cL = imagecolorat($bgFront, 70, $y);
    $cR = imagecolorat($bgFront, 1150, $y);
    $rL = ($cL >> 16) & 0xFF;
    $gL = ($cL >> 8) & 0xFF;
    $bL = $cL & 0xFF;
    $rR = ($cR >> 16) & 0xFF;
    $gR = ($cR >> 8) & 0xFF;
    $bR = $cR & 0xFF;

    for ($x = 90; $x <= 1134; $x++) {
        $t = ($x - 90) / (1134 - 90);
        $r = (int) ($rL + $t * ($rR - $rL));
        $g = (int) ($gL + $t * ($gR - $gL));
        $b = (int) ($bL + $t * ($bR - $bL));
        imagesetpixel($bgFront, $x, $y, imagecolorallocate($bgFront, $r, $g, $b));
    }
}

// Stamp HD Tulisan Omatiq on Front Card
$tulisanW = 950;
$tulisanH = (int) (imagesy($hdTulisan) * ($tulisanW / imagesx($hdTulisan)));
$tulisanX = (int) (($targetW - $tulisanW) / 2);
$tulisanY = 560;
imagecopyresampled($bgFront, $hdTulisan, $tulisanX, $tulisanY, 0, 0, $tulisanW, $tulisanH, imagesx($hdTulisan), imagesy($hdTulisan));

// Erase old peeking mascots on Front Card up to y=1024
for ($y = 830; $y <= 1024; $y++) {
    $cL = imagecolorat($bgFront, 200, $y);
    $cR = imagecolorat($bgFront, 1150, $y);
    $rL = ($cL >> 16) & 0xFF;
    $gL = ($cL >> 8) & 0xFF;
    $bL = $cL & 0xFF;
    $rR = ($cR >> 16) & 0xFF;
    $gR = ($cR >> 8) & 0xFF;
    $bR = $cR & 0xFF;
    for ($x = 680; $x <= 1100; $x++) {
        $t = ($x - 680) / (1100 - 680);
        $r = (int) ($rL + $t * ($rR - $rL));
        $g = (int) ($gL + $t * ($gR - $gL));
        $b = (int) ($bL + $t * ($bR - $bL));
        imagesetpixel($bgFront, $x, $y, imagecolorallocate($bgFront, $r, $g, $b));
    }
}

// Inpaint www.omatiq.com on Front Card (x=475..745, y=1870..1915)
inpaintVertical($bgFront, 475, 745, 1870, 1915);

// Stamp HD Zakki Amila Atas
$rawTop = imagecreatefrompng($hdZakkiAmilaTop);
$cropTop = cropToNonTransparent($rawTop);
$topScale = 0.30;
$topW = (int) (imagesx($cropTop) * $topScale);
$topH = (int) (imagesy($cropTop) * $topScale);
$topX = 720;
// Bottom of hands rests right at y=1022
$topY = 1022 - $topH;
imagecopyresampled($bgFront, $cropTop, $topX, $topY, 0, 0, $topW, $topH, imagesx($cropTop), imagesy($cropTop));

// Erase and Stamp HD Clean YM Logo beside puzzle icon (x=595, y=123, size: 147x102)
for ($y = 118; $y <= 230; $y++) {
    $cL = imagecolorat($bgFront, 587, $y);
    $cR = imagecolorat($bgFront, 756, $y);
    $rL = ($cL >> 16) & 0xFF;
    $gL = ($cL >> 8) & 0xFF;
    $bL = $cL & 0xFF;
    $rR = ($cR >> 16) & 0xFF;
    $gR = ($cR >> 8) & 0xFF;
    $bR = $cR & 0xFF;
    for ($x = 588; $x <= 755; $x++) {
        $t = ($x - 588) / (755 - 588);
        $r = (int) ($rL + $t * ($rR - $rL));
        $g = (int) ($gL + $t * ($gR - $gL));
        $b = (int) ($bL + $t * ($bR - $bL));
        imagesetpixel($bgFront, $x, $y, imagecolorallocate($bgFront, $r, $g, $b));
    }
}
$rawYM = imagecreatefrompng('public/assets/images/icon-ym.png');
$cropYM = cropToNonTransparent($rawYM);
imagecopyresampled($bgFront, $cropYM, 595, 123, 0, 0, 147, 102, imagesx($cropYM), imagesy($cropYM));

// Clear Dynamic Student Data Box & Sponsor Box
$mintBg = imagecolorallocate($bgFront, 240, 254, 252);
imagefilledrectangle($bgFront, 74, 1024, 1150, 1580, $mintBg);

$sponsorWhite = imagecolorallocate($bgFront, 255, 255, 255);
imagefilledrectangle($bgFront, 74, 1698, 1150, 1842, $sponsorWhite);

stripBlackBorders($bgFront, $targetW, $targetH);
imagepng($bgFront, $outFrontPath);
echo "Saved: $outFrontPath\n";

echo "=== OFFICIAL CARD BACKGROUNDS GENERATED SUCCESSFULLY ===\n";
