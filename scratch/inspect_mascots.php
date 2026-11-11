<?php

// Check Zakki Amila Atas bottom rows
$im = imagecreatefrompng('public/assets/images/Zakki Amila Atas.png');
$w = imagesx($im);
$h = imagesy($im);
echo "Zakki Amila Atas: $w x $h\n";

// Check the bottom 20 rows of Zakki Amila Atas
for ($y = $h - 20; $y < $h; $y++) {
    $non_trans = 0;
    $white = 0;
    for ($x = 0; $x < $w; $x++) {
        $rgba = imagecolorat($im, $x, $y);
        $alpha = ($rgba >> 24) & 0x7F;
        if ($alpha < 127) {
            $non_trans++;
            $r = ($rgba >> 16) & 0xFF;
            $g = ($rgba >> 8) & 0xFF;
            $b = $rgba & 0xFF;
            if ($r > 240 && $g > 240 && $b > 240) {
                $white++;
            }
        }
    }
    echo "y=$y: non_trans=$non_trans, white=$white\n";
}

// Check where their hands/bodies are
// Let's find the bounding box of non-transparent pixels in Zakki Amila Atas
$minX = $w;
$maxX = 0;
$minY = $h;
$maxY = 0;
for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $rgba = imagecolorat($im, $x, $y);
        $alpha = ($rgba >> 24) & 0x7F;
        if ($alpha < 120) {
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
echo "Zakki Amila Atas non-transparent bbox: x=$minX..$maxX, y=$minY..$maxY\n";
