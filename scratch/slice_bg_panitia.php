<?php

$im = imagecreatefrompng('public/assets/images/bg-panitia.png');
$w = imagesx($im); // 1086
$h = imagesy($im); // 1448

// Slice into top, mid, bot
$top = imagecrop($im, ['x' => 0, 'y' => 0, 'width' => $w, 'height' => 482]);
imagepng($top, 'scratch/bg_panitia_top.png');

$mid = imagecrop($im, ['x' => 0, 'y' => 482, 'width' => $w, 'height' => 484]);
imagepng($mid, 'scratch/bg_panitia_mid.png');

$bot = imagecrop($im, ['x' => 0, 'y' => 966, 'width' => $w, 'height' => 482]);
imagepng($bot, 'scratch/bg_panitia_bot.png');

echo "Saved 3 slices of bg-panitia.png\n";
