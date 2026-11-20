<?php

$path = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794907130755_707d68b3.png';
$img = imagecreatefrompng($path);
$w = imagesx($img);
$h = imagesy($img);

echo "Image dimensions: {$w} x {$h}\n";

// Let's sample horizontal gradient at y = h / 2
$yMid = (int) ($h / 2);
echo "Horizontal scan at y = $yMid:\n";
for ($x = 0; $x < $w; $x += 10) {
    $rgb = imagecolorat($img, $x, $yMid);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    echo "x=$x => rgb($r, $g, $b)\n";
}

// Let's sample vertical line at x = 10 (left edge), x = 50, x = w/2 (center)
echo "\nLeft edge x=5 vertical scan:\n";
for ($y = 0; $y < $h; $y += 5) {
    $rgb = imagecolorat($img, 5, $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    echo "y=$y => rgb($r, $g, $b)\n";
}
