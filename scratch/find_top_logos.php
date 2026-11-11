<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');
$w = imagesx($imF);

// Check columns and rows for y between 50 and 400
// Find non-white/non-mint pixels around x=200..700, y=50..350
$minX = $w;
$maxX = 0;
$minY = 1944;
$maxY = 0;
for ($y = 50; $y < 400; $y++) {
    for ($x = 100; $x < 700; $x++) {
        $c = imagecolorat($imF, $x, $y) & 0xFFFFFF;
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // Background is light teal/white: r > 220, g > 235, b > 235
        if ($r < 210 || $g < 210 || $b < 200) {
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

echo "Logo area detected: x=$minX..$maxX, y=$minY..$maxY (width=".($maxX - $minX).', height='.($maxY - $minY).")\n";

// Let's crop x=$minX-20 .. $maxX+20, y=$minY-20 .. $maxY+20
$crop = imagecrop($imF, ['x' => max(0, $minX - 20), 'y' => max(0, $minY - 20), 'width' => ($maxX - $minX + 40), 'height' => ($maxY - $minY + 40)]);
imagepng($crop, 'scratch/crop_logos_detected.png');
