<?php

$path = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794907130755_707d68b3.png';
$img = imagecreatefrompng($path);
$w = imagesx($img);
$h = imagesy($img);

// Let's scan y at center x = 327 (center of Panitia text):
echo "Vertical scan at x = 327:\n";
for ($y = 0; $y < $h; $y += 2) {
    $rgb = imagecolorat($img, 327, $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    echo "y=$y => rgb($r, $g, $b)\n";
}

// Let's scan y at x = 200 (solid bar without text):
echo "\nVertical scan at x = 200:\n";
for ($y = 0; $y < $h; $y += 2) {
    $rgb = imagecolorat($img, 200, $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    if ($y % 6 == 0 || $y < 20 || $y > 95) {
        echo "y=$y => rgb($r, $g, $b)\n";
    }
}
