<?php

$im2 = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794554817858_3ae89431.png');
$w = imagesx($im2);
$h = imagesy($im2);

// Let's render an ASCII text detection or check colors
for ($y = 20; $y < $h - 20; $y += 10) {
    $row = '';
    $hasDiff = false;
    for ($x = 20; $x < $w - 20; $x += 5) {
        $c = imagecolorat($im2, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // Check if dark teal box or white text
        if ($r > 200 && $g > 200 && $b > 200) {
            $row .= '#';
            $hasDiff = true;
        } elseif ($r < 30 && $g < 90 && $b < 90) {
            $row .= 'X';
            $hasDiff = true;
        } else {
            $row .= '.';
        }
    }
    if ($hasDiff) {
        echo sprintf("%3d: %s\n", $y, $row);
    }
}
