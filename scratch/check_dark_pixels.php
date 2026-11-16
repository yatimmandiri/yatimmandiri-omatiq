<?php

$im = imagecreatefrompng('scratch/pendamping_front_mid.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's find any dark pixels (text usually has dark color, e.g. R < 150, G < 150, B < 150)
$darkPixels = 0;
for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($im, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r < 180 && $g < 160 && $b < 100) {
            $darkPixels++;
        }
    }
}
echo "Dark text pixels in pendamping_front_mid: $darkPixels\n";
