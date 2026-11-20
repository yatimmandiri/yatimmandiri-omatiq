<?php

$front = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png');
$back = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882578_e8913560.png');

$w = imagesx($front);
$h = imagesy($front);

echo "Scanning for Panitia banner / bar:\n";
$barStartY = 0;
$barEndY = 0;
for ($y = 80; $y < 180; $y++) {
    $rgbCenter = imagecolorat($front, (int) ($w / 2), $y);
    $r = ($rgbCenter >> 16) & 0xFF;
    $g = ($rgbCenter >> 8) & 0xFF;
    $b = $rgbCenter & 0xFF;
    // In Panitia bar, either it's white text ("Panitia") or dark teal banner
    // Let's sample at x = 50 (outside text)
    $rgbEdge = imagecolorat($front, 50, $y);
    $re = ($rgbEdge >> 16) & 0xFF;
    $ge = ($rgbEdge >> 8) & 0xFF;
    $be = ($rgbEdge >> 8) & 0xFF;
    if ($ge > 80 && $ge < 130 && $re < 50) {
        if ($barStartY == 0) {
            $barStartY = $y;
        }
        $barEndY = $y;
    }
}
echo "Panitia bar y = $barStartY .. $barEndY\n";

// Bounding box of Mascot in front:
$minX = $w;
$maxX = 0;
$minY = $h;
$maxY = 0;
for ($y = 260; $y < 350; $y++) {
    for ($x = 220; $x < 360; $x++) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        // Mascot skin: r>200, g>160, b>130
        if ($r > 200 && $g > 150 && $b > 120) {
            $minX = min($minX, $x);
            $maxX = max($maxX, $x);
            $minY = min($minY, $y);
            $maxY = max($maxY, $y);
        }
    }
}
echo "Mascot face bounds: x = $minX..$maxX, y = $minY..$maxY (width = ".($maxX - $minX).', height = '.($maxY - $minY).")\n";

// Box top edge:
for ($y = 320; $y < 355; $y++) {
    $rgb = imagecolorat($front, 100, $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    echo "y=$y => r=$r, g=$g, b=$b\n";
}

// Box bottom edge / sponsors / footer:
echo "\nChecking Back side elements:\n";
// QR code bounds on back:
$qrMinX = $w;
$qrMaxX = 0;
$qrMinY = $h;
$qrMaxY = 0;
for ($y = 200; $y < 460; $y++) {
    for ($x = 70; $x < 340; $x++) {
        $rgb = imagecolorat($back, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        // QR white background: r>240, g>240, b>240
        if ($r > 240 && $g > 240 && $b > 240) {
            $qrMinX = min($qrMinX, $x);
            $qrMaxX = max($qrMaxX, $x);
            $qrMinY = min($qrMinY, $y);
            $qrMaxY = max($qrMaxY, $y);
        }
    }
}
echo "Back QR bounds: x = $qrMinX..$qrMaxX, y = $qrMinY..$qrMaxY (w = ".($qrMaxX - $qrMinX).', h = '.($qrMaxY - $qrMinY).")\n";

// Mascot Zakki & Amila bounds on back:
$zakkiMinX = $w;
$zakkiMaxX = 0;
$zakkiMinY = $h;
$zakkiMaxY = 0;
for ($y = 300; $y < 600; $y++) {
    for ($x = 0; $x < 150; $x++) {
        $rgb = imagecolorat($back, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        if ($r > 200 && $g > 150 && $b > 120) { // face
            $zakkiMinX = min($zakkiMinX, $x);
            $zakkiMaxX = max($zakkiMaxX, $x);
            $zakkiMinY = min($zakkiMinY, $y);
            $zakkiMaxY = max($zakkiMaxY, $y);
        }
    }
}
echo "Back Zakki face bounds: x = $zakkiMinX..$zakkiMaxX, y = $zakkiMinY..$zakkiMaxY\n";

$amilaMinX = $w;
$amilaMaxX = 0;
$amilaMinY = $h;
$amilaMaxY = 0;
for ($y = 300; $y < 600; $y++) {
    for ($x = 260; $x < $w; $x++) {
        $rgb = imagecolorat($back, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        if ($r > 200 && $g > 150 && $b > 120) { // face
            $amilaMinX = min($amilaMinX, $x);
            $amilaMaxX = max($amilaMaxX, $x);
            $amilaMinY = min($amilaMinY, $y);
            $amilaMaxY = max($amilaMaxY, $y);
        }
    }
}
echo "Back Amila face bounds: x = $amilaMinX..$amilaMaxX, y = $amilaMinY..$amilaMaxY\n";
