<?php

$im = imagecreatefrompng('public/assets/images/cards/card-chaperone-bg-back.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's check where pure white (#FFFFFF) exists in card-chaperone-bg-back.png
$whitePixels = 0;
$minX = $w;
$maxX = 0;
$minY = $h;
$maxY = 0;
for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($im, $x, $y) & 0xFFFFFF;
        if ($c === 0xFFFFFF) {
            $whitePixels++;
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
echo "card-chaperone-bg-back pure white pixels: $whitePixels\n";
if ($whitePixels > 0) {
    echo "White bounds: x: $minX..$maxX, y: $minY..$maxY\n";
    echo 'Width: '.($maxX - $minX + 1).', Height: '.($maxY - $minY + 1)."\n";
}
