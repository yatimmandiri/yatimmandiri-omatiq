<?php

$im = imagecreatefrompng('scratch/raw_3ae89431.png');
// Let's crop y=240 to 350
$crop = imagecrop($im, ['x' => 0, 'y' => 240, 'width' => 408, 'height' => 110]);
imagepng($crop, 'scratch/raw_pan_peeking.png');
echo "Saved scratch/raw_pan_peeking.png\n";

// Let's check colors in y=280..330 across x
for ($y = 280; $y <= 330; $y += 10) {
    $cMid = imagecolorsforindex($im, imagecolorat($im, 204, $y));
    $cL = imagecolorsforindex($im, imagecolorat($im, 100, $y));
    $cR = imagecolorsforindex($im, imagecolorat($im, 300, $y));
    echo sprintf("y=%3d: Mid RGB(%3d,%3d,%3d), L RGB(%3d,%3d,%3d), R RGB(%3d,%3d,%3d)\n",
        $y,
        $cMid['red'], $cMid['green'], $cMid['blue'],
        $cL['red'], $cL['green'], $cL['blue'],
        $cR['red'], $cR['green'], $cR['blue']
    );
}
