<?php

$im = imagecreatefrompng('scratch/raw_pan_sponsors.png');
$w = imagesx($im);
$h = imagesy($im);
// Count colored pixels (e.g. Telkomsel red, Bank BJB blue)
$colored = 0;
for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorsforindex($im, imagecolorat($im, $x, $y));
        if ($c['red'] > 200 && $c['green'] < 50 && $c['blue'] < 50) { // Telkomsel red
            $colored++;
        }
    }
}
echo "Telkomsel red pixels: $colored\n";
