<?php

// Let's inspect panitia_1 and panitia_2 visually by dumping some info or slicing them into pngs
$p1 = imagecreatefrompng('scratch/panitia_1.png');
$p2 = imagecreatefrompng('scratch/panitia_2.png');

// Crop top 200px of both
$top1 = imagecrop($p1, ['x' => 0, 'y' => 0, 'width' => 408, 'height' => 200]);
imagepng($top1, 'scratch/p1_top.png');

$mid1 = imagecrop($p1, ['x' => 0, 'y' => 200, 'width' => 408, 'height' => 250]);
imagepng($mid1, 'scratch/p1_mid.png');

$bot1 = imagecrop($p1, ['x' => 0, 'y' => 450, 'width' => 408, 'height' => 198]);
imagepng($bot1, 'scratch/p1_bot.png');

$top2 = imagecrop($p2, ['x' => 0, 'y' => 0, 'width' => 408, 'height' => 200]);
imagepng($top2, 'scratch/p2_top.png');

$mid2 = imagecrop($p2, ['x' => 0, 'y' => 200, 'width' => 408, 'height' => 250]);
imagepng($mid2, 'scratch/p2_mid.png');

$bot2 = imagecrop($p2, ['x' => 0, 'y' => 450, 'width' => 408, 'height' => 198]);
imagepng($bot2, 'scratch/p2_bot.png');

echo "Saved crops for p1 and p2\n";
