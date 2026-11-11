<?php

$imB = imagecreatefrompng('public/assets/images/cards/card-bg-back.png');
$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');

// Check Zakki area on back: x=0..400, y=900..1600
$cropZakki = imagecrop($imB, ['x' => 0, 'y' => 850, 'width' => 450, 'height' => 700]);
imagepng($cropZakki, 'scratch/crop_zakki_back.png');

// Check Amila area on back: x=750..1224, y=850..1600
$cropAmila = imagecrop($imB, ['x' => 774, 'y' => 850, 'width' => 450, 'height' => 700]);
imagepng($cropAmila, 'scratch/crop_amila_back.png');

// Check bottom of front card: y=1800..1944
$cropBottomF = imagecrop($imF, ['x' => 350, 'y' => 1800, 'width' => 524, 'height' => 144]);
imagepng($cropBottomF, 'scratch/crop_bottom_front.png');

// Check bottom of back card: y=1400..1944
$cropBottomB = imagecrop($imB, ['x' => 350, 'y' => 1400, 'width' => 524, 'height' => 544]);
imagepng($cropBottomB, 'scratch/crop_bottom_back.png');

// Check Zakki & Amila top on front: y=800..1150
$cropPeekingF = imagecrop($imF, ['x' => 600, 'y' => 800, 'width' => 550, 'height' => 350]);
imagepng($cropPeekingF, 'scratch/crop_peeking_front.png');

echo "Crops saved successfully.\n";
