<?php

$imB = imagecreatefrompng('scratch/test_bg_back.png');
$imF = imagecreatefrompng('scratch/test_bg_front.png');

// 1. Front Title crop
$cropTitleF = imagecrop($imF, ['x' => 100, 'y' => 500, 'width' => 1024, 'height' => 350]);
imagepng($cropTitleF, 'scratch/verify_front_title.png');

// 2. Back Title crop
$cropTitleB = imagecrop($imB, ['x' => 100, 'y' => 250, 'width' => 1024, 'height' => 350]);
imagepng($cropTitleB, 'scratch/verify_back_title.png');

// 3. Front Mascots + Card Border
$cropPeekingF = imagecrop($imF, ['x' => 650, 'y' => 780, 'width' => 500, 'height' => 300]);
imagepng($cropPeekingF, 'scratch/verify_front_peeking.png');

// 4. Back Zakki (left)
$cropZakkiB = imagecrop($imB, ['x' => 0, 'y' => 750, 'width' => 450, 'height' => 650]);
imagepng($cropZakkiB, 'scratch/verify_back_zakki.png');

// 5. Back Amila (right)
$cropAmilaB = imagecrop($imB, ['x' => 774, 'y' => 750, 'width' => 450, 'height' => 650]);
imagepng($cropAmilaB, 'scratch/verify_back_amila.png');

// 6. Front Bottom 3D cube
$cropCubeF = imagecrop($imF, ['x' => 400, 'y' => 1820, 'width' => 424, 'height' => 124]);
imagepng($cropCubeF, 'scratch/verify_front_cube.png');

// 7. Back Bottom 3D cube
$cropCubeB = imagecrop($imB, ['x' => 400, 'y' => 1440, 'width' => 424, 'height' => 140]);
imagepng($cropCubeB, 'scratch/verify_back_cube.png');

echo "All verification crops created successfully.\n";
