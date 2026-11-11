<?php

$im = imagecreatefrompng('scratch/test_card_front_crisp_ym.png');

// Check Left icon: x=470..590, y=115..235
$minLX = 9999;
$maxLX = 0;
$minLY = 9999;
$maxLY = 0;
for ($y = 115; $y <= 235; $y++) {
    for ($x = 470; $x <= 590; $x++) {
        $c = imagecolorat($im, $x, $y) & 0xFFFFFF;
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if (! ($r >= 240 && $g >= 248 && $b >= 248)) {
            if ($x < $minLX) {
                $minLX = $x;
            }
            if ($x > $maxLX) {
                $maxLX = $x;
            }
            if ($y < $minLY) {
                $minLY = $y;
            }
            if ($y > $maxLY) {
                $maxLY = $y;
            }
        }
    }
}

// Check Right YM icon: x=590..760, y=115..235
$minRX = 9999;
$maxRX = 0;
$minRY = 9999;
$maxRY = 0;
for ($y = 115; $y <= 235; $y++) {
    for ($x = 590; $x <= 760; $x++) {
        $c = imagecolorat($im, $x, $y) & 0xFFFFFF;
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if (! ($r >= 240 && $g >= 248 && $b >= 248)) {
            if ($x < $minRX) {
                $minRX = $x;
            }
            if ($x > $maxRX) {
                $maxRX = $x;
            }
            if ($y < $minRY) {
                $minRY = $y;
            }
            if ($y > $maxRY) {
                $maxRY = $y;
            }
        }
    }
}

echo "Left Puzzle Icon : x=$minLX..$maxLX (w=".($maxLX - $minLX + 1)."), y=$minLY..$maxLY (h=".($maxLY - $minLY + 1).")\n";
echo "Right Clean YM   : x=$minRX..$maxRX (w=".($maxRX - $minRX + 1)."), y=$minRY..$maxRY (h=".($maxRY - $minRY + 1).")\n";
echo 'Gap: '.($minRX - $maxLX)."px\n";
echo "Combined X: $minLX..$maxRX (total width = ".($maxRX - $minLX + 1).'px, center = '.(($minLX + $maxRX) / 2)."px)\n";
