<?php

$im = imagecreatefrompng('scratch/direct_chaperone_back_hd.png');
$w = imagesx($im);
$h = imagesy($im);

$minX = $w;
$maxX = 0;
$minY = $h;
$maxY = 0;
for ($y = 600; $y < 1400; $y++) {
    for ($x = 100; $x < 1124; $x++) {
        $c = imagecolorat($im, $x, $y) & 0xFFFFFF;
        // White or near white
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r > 250 && $g > 250 && $b > 250) {
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
echo "White area in direct_chaperone_back_hd: x: $minX..$maxX, y: $minY..$maxY\n";
echo 'Width: '.($maxX - $minX + 1).', Height: '.($maxY - $minY + 1)."\n";
