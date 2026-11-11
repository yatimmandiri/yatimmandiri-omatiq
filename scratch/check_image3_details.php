<?php

$im3 = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794346596213_566a698f.png');
$w = imagesx($im3);
$h = imagesy($im3);
echo "Image 3: {$w}x{$h}\n";

// Find where www.omatiq.com is in this image:
// Sample colors across y
for ($y = 15; $y < 50; $y += 5) {
    for ($x = 180; $x < 350; $x += 30) {
        $c = imagecolorat($im3, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        printf("x=%d, y=%d: #%02x%02x%02x\n", $x, $y, $r, $g, $b);
    }
}
