<?php

// Check crop of icon-ym.png
$rawYM = imagecreatefrompng('public/assets/images/icon-ym.png');
// Find exact non-transparent bounds
$w = imagesx($rawYM);
$h = imagesy($rawYM);
$minX = $w;
$maxX = 0;
$minY = $h;
$maxY = 0;
for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($rawYM, $x, $y);
        $a = ($c >> 24) & 0x7F;
        if ($a < 125) {
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
$cropYM = imagecreatetruecolor($cw, $ch);
imagealphablending($cropYM, false);
imagesavealpha($cropYM, true);
$trans = imagecolorallocatealpha($cropYM, 0, 0, 0, 127);
imagefilledrectangle($cropYM, 0, 0, $cw, $ch, $trans);
imagecopy($cropYM, $rawYM, 0, 0, $minX, $minY, $cw, $ch);

imagepng($cropYM, 'scratch/crop_ym_clean.png');
echo "Cropped clean YM logo: {$cw}x{$ch}\n";
