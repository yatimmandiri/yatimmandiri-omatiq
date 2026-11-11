<?php

$im = imagecreatefrompng('public/assets/images/Tulisan Omatiq.png');
$w = imagesx($im);
$h = imagesy($im);
echo "Tulisan Omatiq: $w x $h\n";

// Bounding box of non-transparent pixels:
$minX = $w;
$maxX = 0;
$minY = $h;
$maxY = 0;
for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($im, $x, $y);
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
echo "Non-transparent bounds: x=$minX..$maxX, y=$minY..$maxY (width=".($maxX - $minX + 1).', height='.($maxY - $minY + 1).")\n";
