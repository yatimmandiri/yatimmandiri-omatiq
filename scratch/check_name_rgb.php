<?php

$front = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png');

for ($y = 370; $y < 420; $y += 5) {
    for ($x = 100; $x < 300; $x += 20) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        echo "x=$x, y=$y => rgb($r, $g, $b)\n";
    }
}
