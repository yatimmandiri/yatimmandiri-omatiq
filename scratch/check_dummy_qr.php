<?php

$im = imagecreatefrompng('scratch/pendamping_back_center.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's inspect where the dummy QR is located (x and y bounds)
$minX = $w;
$maxX = 0;
$minY = $h;
$maxY = 0;
for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($im, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // The dummy QR code is olive/gold: R ~ 160..190, G ~ 150..175, B ~ 80..115
        if ($r > 140 && $r < 200 && $g > 130 && $g < 190 && $b > 70 && $b < 125) {
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
echo "Dummy QR bounds in pendamping_back_center: x: $minX..$maxX, y: $minY..$maxY\n";
echo 'Width: '.($maxX - $minX + 1).', Height: '.($maxY - $minY + 1)."\n";
echo 'Relative to full 408x648: y = '.($minY + 180).' to '.($maxY + 180)."\n";
