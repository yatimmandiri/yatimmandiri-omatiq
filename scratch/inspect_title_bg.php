<?php

$rawF = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798593_73231e09.png');
// Size is 408 x 648
// Let's check color samples at x=20, 50, 350, 390 for y from 160 to 280 (which is y=480..840 in 3x)
for ($y = 170; $y <= 270; $y += 10) {
    $c1 = imagecolorat($rawF, 20, $y);
    $c2 = imagecolorat($rawF, 388, $y);
    printf("raw y=%d: left=#%06x, right=#%06x\n", $y, $c1 & 0xFFFFFF, $c2 & 0xFFFFFF);
}
