<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');
$cropYM = imagecreatefrompng('scratch/crop_ym_clean.png');
$srcW = imagesx($cropYM);
$srcH = imagesy($cropYM);

// Let's create test images with different heights: 98, 102, 106
foreach ([96, 100, 102, 106] as $targetH) {
    $test = imagecreatetruecolor(imagesx($imF), imagesy($imF));
    imagecopy($test, $imF, 0, 0, 0, 0, imagesx($imF), imagesy($imF));

    // Erase old YM logo at x=587..760, y=115..235
    for ($y = 115; $y <= 235; $y++) {
        $cL = imagecolorat($test, 587, $y);
        $cR = imagecolorat($test, 760, $y);
        $rL = ($cL >> 16) & 0xFF;
        $gL = ($cL >> 8) & 0xFF;
        $bL = $cL & 0xFF;
        $rR = ($cR >> 16) & 0xFF;
        $gR = ($cR >> 8) & 0xFF;
        $bR = $cR & 0xFF;
        for ($x = 588; $x <= 759; $x++) {
            $t = ($x - 588) / (759 - 588);
            $r = (int) ($rL + $t * ($rR - $rL));
            $g = (int) ($gL + $t * ($gR - $gL));
            $b = (int) ($bL + $t * ($bR - $bL));
            imagesetpixel($test, $x, $y, imagecolorallocate($test, $r, $g, $b));
        }
    }

    $targetW = (int) ($targetH * ($srcW / $srcH));

    // Left puzzle icon: x=480..584, y=123..224 (H=102, CenterY=173.5)
    // Vertical center at 173.5
    $destY = (int) (173.5 - $targetH / 2);

    // Total width of pair centered at X=612
    // If left icon is at 480..584, gap is 12px -> destX = 596
    $destX = 596;

    imagealphablending($test, true);
    imagecopyresampled($test, $cropYM, $destX, $destY, 0, 0, $targetW, $targetH, $srcW, $srcH);

    // Save a crop of the header (x=440..780, y=100..250)
    $cropHeader = imagecrop($test, ['x' => 450, 'y' => 100, 'width' => 320, 'height' => 150]);
    imagepng($cropHeader, "scratch/test_header_h{$targetH}.png");
    echo "Saved scratch/test_header_h{$targetH}.png (dest: {$destX},{$destY}, size: {$targetW}x{$targetH})\n";
}
