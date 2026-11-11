<?php

$z = imagecreatefrompng('public/assets/images/Zakki Window Hi.png');
$wZ = imagesx($z);
$hZ = imagesy($z);
$minX = $wZ;
$maxX = 0;
$minY = $hZ;
$maxY = 0;
for ($y = 0; $y < $hZ; $y++) {
    for ($x = 0; $x < $wZ; $x++) {
        $c = imagecolorat($z, $x, $y);
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
echo "Zakki Window Hi bounds: x=$minX..$maxX, y=$minY..$maxY (w=".($maxX - $minX + 1).', h='.($maxY - $minY + 1).")\n";

$a = imagecreatefrompng('public/assets/images/Amila Window Hi.png');
$wA = imagesx($a);
$hA = imagesy($a);
$minX = $wA;
$maxX = 0;
$minY = $hA;
$maxY = 0;
for ($y = 0; $y < $hA; $y++) {
    for ($x = 0; $x < $wA; $x++) {
        $c = imagecolorat($a, $x, $y);
        $aCol = ($c >> 24) & 0x7F;
        if ($aCol < 120) {
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
echo "Amila Window Hi bounds: x=$minX..$maxX, y=$minY..$maxY (w=".($maxX - $minX + 1).', h='.($maxY - $minY + 1).")\n";
