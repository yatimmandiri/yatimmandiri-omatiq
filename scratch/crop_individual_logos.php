<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');

$cropLeft = imagecrop($imF, ['x' => 470, 'y' => 115, 'width' => 125, 'height' => 120]);
imagepng($cropLeft, 'scratch/logo_left.png');

$cropRight = imagecrop($imF, ['x' => 590, 'y' => 115, 'width' => 165, 'height' => 120]);
imagepng($cropRight, 'scratch/logo_right.png');

$cropBoth = imagecrop($imF, ['x' => 460, 'y' => 105, 'width' => 300, 'height' => 140]);
imagepng($cropBoth, 'scratch/logo_both.png');

echo "Saved crops.\n";
