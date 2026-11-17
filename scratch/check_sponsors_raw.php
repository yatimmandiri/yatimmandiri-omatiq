<?php

$im = imagecreatefrompng('scratch/raw_3ae89431.png');
// Check y=480..580 in 408x648 (which is y=1440..1740 in 1224x1932)
$crop = imagecrop($im, ['x' => 50, 'y' => 480, 'width' => 308, 'height' => 90]);
imagepng($crop, 'scratch/raw_pan_sponsors.png');
echo "Saved scratch/raw_pan_sponsors.png\n";
