<?php

$im = imagecreatefrompng('scratch/raw_1b8f3562.png');
// In 408x648, 1355/3 = ~452
// Let's check y from 430 to 480 in 408x648
for ($y = 430; $y <= 480; $y += 5) {
    $c = imagecolorsforindex($im, imagecolorat($im, 204, $y));
    echo sprintf("y=%3d (scale3=%4d): RGB(%3d,%3d,%3d)\n", $y, $y * 3, $c['red'], $c['green'], $c['blue']);
}
