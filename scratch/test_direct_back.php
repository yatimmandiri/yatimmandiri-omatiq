<?php

$im = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794554817867_01639dbf.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's upscale to 1224x1932 (target card size)
$targetW = 1224;
$targetH = 1932;
$canvas = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($canvas, $im, 0, 0, 0, 0, $targetW, $targetH, $w, $h);

imagepng($canvas, 'scratch/direct_chaperone_back_hd.png');
echo "Saved scratch/direct_chaperone_back_hd.png\n";

// Now let's inspect the area between Zakki and Amila in direct_chaperone_back_hd.png
// Zakki right edge: where is it?
// Amila left edge: where is it?
