<?php

$im = imagecreatefrompng('public/assets/images/bg-pendamping.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's check color variation across the entire image
$minR = 255;
$maxR = 0;
$minG = 255;
$maxG = 0;
$minB = 255;
$maxB = 0;

for ($y = 0; $y < $h; $y += 10) {
    for ($x = 0; $x < $w; $x += 10) {
        $c = imagecolorat($im, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r < $minR) {
            $minR = $r;
        } if ($r > $maxR) {
            $maxR = $r;
        }
        if ($g < $minG) {
            $minG = $g;
        } if ($g > $maxG) {
            $maxG = $g;
        }
        if ($b < $minB) {
            $minB = $b;
        } if ($b > $maxB) {
            $maxB = $b;
        }
    }
}
echo "bg-pendamping.png color ranges:\n";
echo "R: $minR..$maxR, G: $minG..$maxG, B: $minB..$maxB\n";
