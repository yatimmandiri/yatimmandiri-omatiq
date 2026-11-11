<?php

// Load source assets
$rawFrontPath = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798593_73231e09.png';
$rawBackPath = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798570_9e7d3f1e.png';

$hdTulisanPath = 'public/assets/images/Tulisan Omatiq.png';
$hdZakkiBackPath = 'public/assets/images/Zakki Window Hi.png';
$hdAmilaBackPath = 'public/assets/images/Amila Window Hi.png';
$hdZakkiAmilaTop = 'public/assets/images/Zakki Amila Atas.png';

$targetW = 1224;
$targetH = 1944;

echo "=== BUILDING CARD BACKGROUNDS ===\n";

// Helper: crop image to non-transparent bounds
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

// Helper: draw rounded rectangle
function fillRoundedRect($im, $x1, $y1, $x2, $y2, $radius, $color)
{
    imagefilledrectangle($im, $x1 + $radius, $y1, $x2 - $radius, $y2, $color);
    imagefilledrectangle($im, $x1, $y1 + $radius, $x2, $y2 - $radius, $color);
    imagefilledellipse($im, $x1 + $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x2 - $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x1 + $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x2 - $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
}

// Helper: inpaint text by vertical interpolation
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

// -------------------------------------------------------------
// 1. GENERATE CARD-BG-BACK.PNG
// -------------------------------------------------------------
echo "Processing Back Card...\n";
$rawB = imagecreatefrompng($rawBackPath);
$bgBack = imagecreatetruecolor($targetW, $targetH);
// High-quality resample to 1224 x 1944
imagecopyresampled($bgBack, $rawB, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawB), imagesy($rawB));

// (A) Erase old title area: y=270..560, x=100..1124 with vertical card gradient
// Let's get clean background colors at left (x=70) and right (x=1150)
for ($y = 270; $y <= 560; $y++) {
    $cL = imagecolorat($bgBack, 70, $y);
    $cR = imagecolorat($bgBack, 1150, $y);
    $rL = ($cL >> 16) & 0xFF;
    $gL = ($cL >> 8) & 0xFF;
    $bL = $cL & 0xFF;
    $rR = ($cR >> 16) & 0xFF;
    $gR = ($cR >> 8) & 0xFF;
    $bR = $cR & 0xFF;

    // Feathered gradient between x=90 and x=1134
    for ($x = 90; $x <= 1134; $x++) {
        $t = ($x - 90) / (1134 - 90);
        $r = (int) ($rL + $t * ($rR - $rL));
        $g = (int) ($gL + $t * ($gR - $gL));
        $b = (int) ($bL + $t * ($bR - $bL));
        imagesetpixel($bgBack, $x, $y, imagecolorallocate($bgBack, $r, $g, $b));
    }
}

// (B) Stamp HD Tulisan Omatiq on Back Card
$hdTulisan = imagecreatefrompng($hdTulisanPath);
// Width ~ 950 px, height ~ 247 px (centered at x = (1224 - 950)/2 = 137, y = 295)
$tulisanW = 950;
$tulisanH = (int) (imagesy($hdTulisan) * ($tulisanW / imagesx($hdTulisan)));
$tulisanX = (int) (($targetW - $tulisanW) / 2);
$tulisanY = 295;
imagecopyresampled($bgBack, $hdTulisan, $tulisanX, $tulisanY, 0, 0, $tulisanW, $tulisanH, imagesx($hdTulisan), imagesy($hdTulisan));

// (C) Erase old Zakki (left: x=0..390, y=750..1620)
// The card background here transitions smoothly from #e1fffa (at y=750) down to #dff1f1 (at y=1620)
for ($y = 750; $y <= 1620; $y++) {
    $tY = ($y - 750) / (1620 - 750);
    // Interpolate between #e1fffa (225, 255, 250) and #dff1f1 (223, 241, 241)
    $r = (int) (225 + $tY * (223 - 225));
    $g = (int) (255 + $tY * (241 - 255));
    $b = (int) (250 + $tY * (241 - 250));
    $col = imagecolorallocate($bgBack, $r, $g, $b);
    for ($x = 0; $x <= 390; $x++) {
        imagesetpixel($bgBack, $x, $y, $col);
    }
}

// (D) Erase old Amila (right: x=830..1224, y=750..1650)
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

// (E) Inpaint www.omatiq.com on Back Card (x=465..750, y=1480..1530)
inpaintVertical($bgBack, 465, 750, 1480, 1530);

// (F) Crop and Stamp HD Zakki on Left
$rawZakki = imagecreatefrompng($hdZakkiBackPath);
$cropZakki = cropToNonTransparent($rawZakki);
$zScale = 0.35;
$zW = (int) (imagesx($cropZakki) * $zScale);
$zH = (int) (imagesy($cropZakki) * $zScale);
// Place at x=20 (away from left fold line), y=870
$zX = 20;
$zY = 870;
imagecopyresampled($bgBack, $cropZakki, $zX, $zY, 0, 0, $zW, $zH, imagesx($cropZakki), imagesy($cropZakki));

// (G) Crop and Stamp HD Amila on Right
$rawAmila = imagecreatefrompng($hdAmilaBackPath);
$cropAmila = cropToNonTransparent($rawAmila);
$aScale = 0.35;
$aW = (int) (imagesx($cropAmila) * $aScale);
$aH = (int) (imagesy($cropAmila) * $aScale);
// Place at x = 975 (hand starts at 975, right edge ~1208, safely away from right margin), y=860
$aX = 975;
$aY = 860;
imagecopyresampled($bgBack, $cropAmila, $aX, $aY, 0, 0, $aW, $aH, imagesx($cropAmila), imagesy($cropAmila));

// (H) Draw White Rounded QR Box on Top (x=261..960, y=696..1332, radius=45)
// This guarantees 100% pure white, crisp corners, and zero mascot occlusion on QR
$white = imagecolorallocate($bgBack, 255, 255, 255);
fillRoundedRect($bgBack, 261, 696, 960, 1332, 45, $white);

imagepng($bgBack, 'scratch/test_bg_back.png');
echo "Back Card saved to scratch/test_bg_back.png\n";

// -------------------------------------------------------------
// 2. GENERATE CARD-BG-FRONT.PNG
// -------------------------------------------------------------
echo "Processing Front Card...\n";
$rawF = imagecreatefrompng($rawFrontPath);
$bgFront = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($bgFront, $rawF, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawF), imagesy($rawF));

// (A) Erase old title area on Front: y=530..820, x=100..1124 with vertical card gradient
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

// (B) Stamp HD Tulisan Omatiq on Front Card
$tulisanW = 950;
$tulisanH = (int) (imagesy($hdTulisan) * ($tulisanW / imagesx($hdTulisan)));
$tulisanX = (int) (($targetW - $tulisanW) / 2);
$tulisanY = 560;
imagecopyresampled($bgFront, $hdTulisan, $tulisanX, $tulisanY, 0, 0, $tulisanW, $tulisanH, imagesx($hdTulisan), imagesy($hdTulisan));

// (C) Erase old peeking mascots on Front Card: x=680..1100, y=830..1022
for ($y = 830; $y <= 1022; $y++) {
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

// (D) Erase text www.omatiq.com on Front Card (x=475..745, y=1870..1915)
inpaintVertical($bgFront, 475, 745, 1870, 1915);

// (E) Stamp HD Zakki Amila Atas
$rawTop = imagecreatefrompng($hdZakkiAmilaTop);
$cropTop = cropToNonTransparent($rawTop);
// In raw, bbox was width ~310 px, height ~160 px
$topScale = 0.30;
$topW = (int) (imagesx($cropTop) * $topScale);
$topH = (int) (imagesy($cropTop) * $topScale);
// Position: right side, x=715..1085
$topX = 720;
// Bottom of their hands rests right on y=1022 (top edge of card box at y=1020)
$topY = 1022 - $topH;
imagecopyresampled($bgFront, $cropTop, $topX, $topY, 0, 0, $topW, $topH, imagesx($cropTop), imagesy($cropTop));

// (F) Clear Dynamic Student Data Box & Sponsor Box
// Student Data box: x=72..1152, y=1026..1584 -> fill with clean pale mint #f0fefc
$mintBg = imagecolorallocate($bgFront, 240, 254, 252);
imagefilledrectangle($bgFront, 74, 1026, 1150, 1580, $mintBg);

// Sponsor box: x=72..1152, y=1698..1842 -> fill with pure white #ffffff
$sponsorWhite = imagecolorallocate($bgFront, 255, 255, 255);
imagefilledrectangle($bgFront, 74, 1698, 1150, 1842, $sponsorWhite);

imagepng($bgFront, 'scratch/test_bg_front.png');
echo "Front Card saved to scratch/test_bg_front.png\n";

echo "=== ALL DONE ===\n";
