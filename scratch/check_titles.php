<?php

$f = imagecreatefrompng('scratch/test_panitia_front.png');
$cropF = imagecrop($f, ['x' => 150, 'y' => 500, 'width' => 924, 'height' => 350]);
imagepng($cropF, 'scratch/test_pan_front_title.png');

$b = imagecreatefrompng('scratch/test_panitia_back.png');
$cropB = imagecrop($b, ['x' => 150, 'y' => 250, 'width' => 924, 'height' => 400]);
imagepng($cropB, 'scratch/test_pan_back_title.png');

echo "Saved test_pan_front_title.png and test_pan_back_title.png\n";
