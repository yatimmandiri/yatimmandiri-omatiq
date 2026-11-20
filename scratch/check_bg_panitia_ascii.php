<?php

// Dump ascii map of bg-panitia.png to see if there is any white text or characters
$im = imagecreatefrompng('public/assets/images/bg-panitia.png');
$w = imagesx($im);
$h = imagesy($im);

echo "bg-panitia.png ascii map:\n";
for ($y = 0; $y < $h; $y += 35) {
    $line = sprintf('%4d ', $y);
    for ($x = 0; $x < $w; $x += 25) {
        $c = imagecolorsforindex($im, imagecolorat($im, $x, $y));
        if ($c['red'] > 240 && $c['green'] > 240 && $c['blue'] > 240) {
            $line .= '#';
        } elseif ($c['red'] < 30 && $c['green'] > 80 && $c['blue'] > 80) {
            $line .= 'T';
        } else {
            $line .= '.';
        }
    }
    echo $line."\n";
}
