<?php

// Dump an ascii map of Tulisan Omatiq Putih.png
$im = imagecreatefrompng('public/assets/images/Tulisan Omatiq Putih.png');
$w = imagesx($im);
$h = imagesy($im);
echo "Tulisan Omatiq Putih map ($w x $h):\n";
for ($y = 0; $y < $h; $y += 35) {
    $line = sprintf('%3d ', $y);
    for ($x = 0; $x < $w; $x += 40) {
        $c = imagecolorat($im, $x, $y);
        $a = ($c >> 24) & 0x7F;
        $line .= ($a < 60) ? '#' : '.';
    }
    echo $line."\n";
}
