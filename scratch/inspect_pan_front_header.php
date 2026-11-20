<?php

$im = imagecreatefrompng('scratch/raw_3ae89431.png');
// In raw_3ae89431 (408x648):
// When scaled to 1224x1932 (scale = 3):
// y: 100..235 corresponds to y: 33..78 in 408x648.
// Let's check what is in y: 30..90 of raw_3ae89431!
echo "=== raw_3ae89431 y=30..90 ===\n";
for ($y = 30; $y <= 90; $y += 5) {
    $cMid = imagecolorsforindex($im, imagecolorat($im, 204, $y));
    $cL = imagecolorsforindex($im, imagecolorat($im, 50, $y));
    $cR = imagecolorsforindex($im, imagecolorat($im, 350, $y));
    echo sprintf("y=%2d: Mid RGB(%3d,%3d,%3d), L RGB(%3d,%3d,%3d), R RGB(%3d,%3d,%3d)\n",
        $y,
        $cMid['red'], $cMid['green'], $cMid['blue'],
        $cL['red'], $cL['green'], $cL['blue'],
        $cR['red'], $cR['green'], $cR['blue']
    );
}
