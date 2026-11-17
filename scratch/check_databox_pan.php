<?php

$im = imagecreatefrompng('scratch/raw_3ae89431.png');
$crop = imagecrop($im, ['x' => 0, 'y' => 330, 'width' => 408, 'height' => 120]);
imagepng($crop, 'scratch/pan_front_databox_raw.png');
echo "Saved scratch/pan_front_databox_raw.png\n";

// Let's inspect colors of the box
// Where are the borders of the translucent glass box in raw_3ae89431?
for ($y = 330; $y <= 430; $y += 10) {
    $cMid = imagecolorsforindex($im, imagecolorat($im, 204, $y));
    $cL = imagecolorsforindex($im, imagecolorat($im, 40, $y));
    echo sprintf("y=%3d: Mid RGB(%3d,%3d,%3d), Left RGB(%3d,%3d,%3d)\n", $y, $cMid['red'], $cMid['green'], $cMid['blue'], $cL['red'], $cL['green'], $cL['blue']);
}
