<?php

$imB = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798570_9e7d3f1e.png');

// In 1x scale, Zakki is at x=0..105, y=315..535
// Amila is at x=300..408, y=325..550
// Let's sample colors on the card background:
for ($y = 300; $y <= 550; $y += 50) {
    $cL = imagecolorat($imB, 115, $y); // just inside the QR card or next to Zakki
    $cR = imagecolorat($imB, 290, $y);
    printf("y=%d: cL=#%02x%02x%02x, cR=#%02x%02x%02x\n", $y, ($cL >> 16) & 0xFF, ($cL >> 8) & 0xFF, $cL & 0xFF, ($cR >> 16) & 0xFF, ($cR >> 8) & 0xFF, $cR & 0xFF);
}
