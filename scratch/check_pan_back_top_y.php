<?php

$im = imagecreatefrompng('scratch/raw_1b8f3562.png');
for ($y = 230; $y <= 265; $y += 5) {
    $c = imagecolorsforindex($im, imagecolorat($im, 204, $y));
    echo sprintf("y=%3d (scale3=%4d): RGB(%3d,%3d,%3d)\n", $y, $y * 3, $c['red'], $c['green'], $c['blue']);
}
