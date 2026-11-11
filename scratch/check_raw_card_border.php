<?php

$rawF = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798593_73231e09.png');
// In rawF, let's check column x=50 (outside mascot) for y from 335 to 345
for ($y = 336; $y <= 346; $y++) {
    $c = imagecolorat($rawF, 50, $y);
    printf("rawF y=%d (3x: %d): #%06x\n", $y, $y * 3, $c & 0xFFFFFF);
}
