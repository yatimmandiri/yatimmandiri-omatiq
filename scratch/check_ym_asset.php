<?php

$imYM = imagecreatefrompng('public/assets/images/icon-ym.png');
$w = imagesx($imYM);
$h = imagesy($imYM);

echo "icon-ym.png Dimensions: {$w}x{$h}\n";

// Let's find bounding box of non-transparent pixels
$minX = $w;
$maxX = 0;
$minY = $h;
$maxY = 0;
for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($imYM, $x, $y);
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

$bw = $maxX - $minX + 1;
$bh = $maxY - $minY + 1;
echo "Bounding box of icon-ym.png: x=$minX..$maxX, y=$minY..$maxY (W=$bw, H=$bh, AspectRatio=".round($bw / $bh, 3).")\n";
