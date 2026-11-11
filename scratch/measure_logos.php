<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');

// Analyze left icon: x=480..585, y=120..225
$minLX = 9999;
$maxLX = 0;
$minLY = 9999;
$maxLY = 0;
for ($y = 115; $y <= 230; $y++) {
    for ($x = 470; $x <= 585; $x++) {
        $c = imagecolorat($imF, $x, $y) & 0xFFFFFF;
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
$wL = $maxLX - $minLX + 1;
$hL = $maxLY - $minLY + 1;
echo "Left puzzle icon: x=$minLX..$maxLX, y=$minLY..$maxLY (Width=$wL, Height=$hL, CenterY=".(($minLY + $maxLY) / 2).")\n";

// Analyze right YM logo: x=590..750, y=120..230
$minRX = 9999;
$maxRX = 0;
$minRY = 9999;
$maxRY = 0;
for ($y = 115; $y <= 230; $y++) {
    for ($x = 590; $x <= 760; $x++) {
        $c = imagecolorat($imF, $x, $y) & 0xFFFFFF;
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
$wR = $maxRX - $minRX + 1;
$hR = $maxRY - $minRY + 1;
echo "Right old YM logo: x=$minRX..$maxRX, y=$minRY..$maxRY (Width=$wR, Height=$hR, CenterY=".(($minRY + $maxRY) / 2).")\n";

echo 'Gap between Left Icon and Right Logo: '.($minRX - $maxLX)."px\n";
