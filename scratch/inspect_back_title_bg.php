<?php

$rawB = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798570_9e7d3f1e.png');
// In back card, where is the title? Let's check y=90..190 (3x: 270..570)
for ($y = 90; $y <= 190; $y += 10) {
    $c1 = imagecolorat($rawB, 20, $y);
    $c2 = imagecolorat($rawB, 388, $y);
    printf("rawB y=%d: left=#%06x, right=#%06x\n", $y, $c1 & 0xFFFFFF, $c2 & 0xFFFFFF);
}
