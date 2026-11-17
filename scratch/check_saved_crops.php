<?php

// Check card-bg-back.png and card-chaperone-bg-back.png in the middle
$pes = imagecreatefrompng('public/assets/images/cards/card-bg-back.png');
$cropPes = imagecrop($pes, ['x' => 150, 'y' => 650, 'width' => 924, 'height' => 700]);
imagepng($cropPes, 'scratch/crop_check_pes_back.png');

$pen = imagecreatefrompng('public/assets/images/cards/card-chaperone-bg-back.png');
$cropPen = imagecrop($pen, ['x' => 150, 'y' => 650, 'width' => 924, 'height' => 700]);
imagepng($cropPen, 'scratch/crop_check_pen_back.png');

echo "Saved crop_check_pes_back.png and crop_check_pen_back.png\n";
