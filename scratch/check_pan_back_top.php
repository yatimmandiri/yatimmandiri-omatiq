<?php

$im = imagecreatefrompng('scratch/raw_1b8f3562.png');
// Let's crop y=0 to 180 of raw_1b8f3562
$crop = imagecrop($im, ['x' => 0, 'y' => 0, 'width' => 408, 'height' => 180]);
imagepng($crop, 'scratch/pan_back_top_raw.png');
echo "Saved scratch/pan_back_top_raw.png\n";

// Let's sample colors
for ($y = 10; $y <= 120; $y += 10) {
    $cMid = imagecolorsforindex($im, imagecolorat($im, 204, $y));
    echo sprintf("y=%3d: Mid RGB(%3d,%3d,%3d)\n", $y, $cMid['red'], $cMid['green'], $cMid['blue']);
}
