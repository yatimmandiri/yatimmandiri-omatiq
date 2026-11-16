<?php

// Compare bg-pendamping.png and bg-panitia.png with the uploaded images
echo "=== Analyzing bg-pendamping.png ===\n";
$im = imagecreatefrompng('public/assets/images/bg-pendamping.png');
echo 'Size: '.imagesx($im).'x'.imagesy($im)."\n";

// Let's crop top, middle, bottom of bg-pendamping.png
$crop = imagecreatetruecolor(400, 300);
imagecopyresampled($crop, $im, 0, 0, 0, 0, 400, 300, imagesx($im), imagesy($im));
imagepng($crop, 'scratch/thumb_bg_pendamping.png');

echo "=== Analyzing bg-panitia.png ===\n";
$im2 = imagecreatefrompng('public/assets/images/bg-panitia.png');
echo 'Size: '.imagesx($im2).'x'.imagesy($im2)."\n";
$crop2 = imagecreatetruecolor(400, 300);
imagecopyresampled($crop2, $im2, 0, 0, 0, 0, 400, 300, imagesx($im2), imagesy($im2));
imagepng($crop2, 'scratch/thumb_bg_panitia.png');

echo "=== Analyzing bg-peserta.png ===\n";
$im3 = imagecreatefrompng('public/assets/images/bg-peserta.png');
echo 'Size: '.imagesx($im3).'x'.imagesy($im3)."\n";
