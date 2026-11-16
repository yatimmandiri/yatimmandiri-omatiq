<?php

$im = imagecreatefrompng('public/assets/images/cards/card-chaperone-bg-back.png');
$w = imagesx($im);
$h = imagesy($im);
echo "card-chaperone-bg-back.png: {$w}x{$h}\n";

// Crop around y: 35%..70%
$cropY = (int) ($h * 0.35);
$cropH = (int) ($h * 0.35);
$crop = imagecreatetruecolor($w, $cropH);
imagecopy($crop, $im, 0, 0, 0, $cropY, $w, $cropH);
imagepng($crop, 'scratch/chaperone_bg_back_middle.png');
echo "Saved scratch/chaperone_bg_back_middle.png\n";

// Let's check if the white box was drawn on top of the mascots in the image
// At x = 270, y = cropY + 100: is it white?
$c = imagecolorat($im, 270, $cropY + 100);
printf("Pixel at (270, %d): #%06X\n", $cropY + 100, $c & 0xFFFFFF);
