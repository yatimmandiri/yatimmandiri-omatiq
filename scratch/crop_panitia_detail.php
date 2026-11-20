<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';

$im1 = imagecreatefrompng($dir.'media_1794554817791_1b8f3562.png');
$im2 = imagecreatefrompng($dir.'media_1794554817858_3ae89431.png');

// Crop top 200px
$crop1Top = imagecreatetruecolor(408, 200);
imagecopy($crop1Top, $im1, 0, 0, 0, 0, 408, 200);
imagepng($crop1Top, 'scratch/panitia_1_top.png');

$crop2Top = imagecreatetruecolor(408, 200);
imagecopy($crop2Top, $im2, 0, 0, 0, 0, 408, 200);
imagepng($crop2Top, 'scratch/panitia_2_top.png');

// Crop mid 250px
$crop1Mid = imagecreatetruecolor(408, 250);
imagecopy($crop1Mid, $im1, 0, 0, 0, 200, 408, 250);
imagepng($crop1Mid, 'scratch/panitia_1_mid.png');

$crop2Mid = imagecreatetruecolor(408, 250);
imagecopy($crop2Mid, $im2, 0, 0, 0, 200, 408, 250);
imagepng($crop2Mid, 'scratch/panitia_2_mid.png');

// Crop bottom 200px
$crop1Bot = imagecreatetruecolor(408, 200);
imagecopy($crop1Bot, $im1, 0, 0, 0, 448, 408, 200);
imagepng($crop1Bot, 'scratch/panitia_1_bot.png');

$crop2Bot = imagecreatetruecolor(408, 200);
imagecopy($crop2Bot, $im2, 0, 0, 0, 448, 408, 200);
imagepng($crop2Bot, 'scratch/panitia_2_bot.png');

echo "Saved crops for panitia_1 and panitia_2\n";
