<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');
$cropYM = imagecreatefrompng('scratch/crop_ym_clean.png');
$srcW = imagesx($cropYM);
$srcH = imagesy($cropYM);

// Cleanly erase the old YM logo at x=588..755, y=118..230
for ($y = 118; $y <= 230; $y++) {
    $cL = imagecolorat($imF, 587, $y);
    $cR = imagecolorat($imF, 756, $y);
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
        imagesetpixel($imF, $x, $y, imagecolorallocate($imF, $r, $g, $b));
    }
}

// Target dimensions: Height=102, Width=147
// Left icon is at x=480..584, y=123..224
// With gap=11px:
// Left icon ends at x=584
// New YM logo starts at x=595, ends at x=595+147=742
// Y position: exactly y=123..225 (matching height of 102px!)
$destX = 595;
$destY = 123;
$destW = 147;
$destH = 102;

imagealphablending($imF, true);
imagecopyresampled($imF, $cropYM, $destX, $destY, 0, 0, $destW, $destH, $srcW, $srcH);

// Save full card to test
imagepng($imF, 'scratch/test_card_front_crisp_ym.png');

// Save zoom crop around both logos
$cropHeader = imagecrop($imF, ['x' => 450, 'y' => 100, 'width' => 320, 'height' => 150]);
imagepng($cropHeader, 'scratch/zoom_header_crisp_ym.png');

echo "Generated test_card_front_crisp_ym.png and zoom_header_crisp_ym.png successfully.\n";
