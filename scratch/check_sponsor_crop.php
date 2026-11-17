<?php

$im = imagecreatefrompng('scratch/test_panitia_front.png');
$crop = imagecrop($im, ['x' => 100, 'y' => 1400, 'width' => 1024, 'height' => 300]);
imagepng($crop, 'scratch/test_pan_sponsors_crop.png');
echo "Saved scratch/test_pan_sponsors_crop.png\n";
