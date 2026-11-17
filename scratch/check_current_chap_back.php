<?php

$im = imagecreatefrompng('public/assets/images/cards/card-chaperone-bg-back.png');
echo "=== card-chaperone-bg-back.png ===\n";
for ($y = 700; $y <= 1350; $y += 100) {
    $cMid = imagecolorsforindex($im, imagecolorat($im, 612, $y));
    $cL = imagecolorsforindex($im, imagecolorat($im, 300, $y));
    $cR = imagecolorsforindex($im, imagecolorat($im, 900, $y));
    echo sprintf("y=%4d: Mid RGB(%3d,%3d,%3d) L RGB(%3d,%3d,%3d) R RGB(%3d,%3d,%3d)\n",
        $y,
        $cMid['red'], $cMid['green'], $cMid['blue'],
        $cL['red'], $cL['green'], $cL['blue'],
        $cR['red'], $cR['green'], $cR['blue']
    );
}
