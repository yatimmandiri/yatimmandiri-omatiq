<?php

$imOld = imagecreatefrompng('scratch/logo_right.png');
// Check old logo bounds in scratch/logo_right.png (which was cropped at x=590, y=115)
$w = imagesx($imOld);
$h = imagesy($imOld);
$minX = $w;
$maxX = 0;
$minY = $h;
$maxY = 0;
for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($imOld, $x, $y) & 0xFFFFFF;
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if (! ($r >= 240 && $g >= 248 && $b >= 248)) {
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
echo "Old YM in crop: x=$minX..$maxX (w=".($maxX - $minX + 1)."), y=$minY..$maxY (h=".($maxY - $minY + 1).")\n";
echo 'Global coords in card: x='.($minX + 590).'..'.($maxX + 590).', y='.($minY + 115).'..'.($maxY + 115)."\n";
