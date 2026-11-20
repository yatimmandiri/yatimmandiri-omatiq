<?php

$front = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png');
$back = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882578_e8913560.png');

$w = imagesx($front);
$h = imagesy($front);

// Let's find container box:
// Top is at y=340.
// Let's find where the box ends at x = 100:
$boxBottom = 0;
for ($y = 350; $y < 600; $y++) {
    $rgb = imagecolorat($front, 100, $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    // Inside box is light tinted (r > 120, g > 180, b > 180).
    // Outside box below is darker teal / glowing cube (r < 60, g < 140)
    if ($y > 500 && $r < 70 && $g < 140) {
        $boxBottom = $y;
        break;
    }
}
echo "Container box bottom at x=100 is around y = $boxBottom\n";

// Let's find left and right borders of the container box at y = 400:
$boxLeft = 0;
$boxRight = 0;
for ($x = 0; $x < $w; $x++) {
    $rgb = imagecolorat($front, $x, 400);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    if ($r > 170 && $g > 220 && $b > 220) {
        if ($boxLeft == 0) {
            $boxLeft = $x;
        }
        $boxRight = $x;
    }
}
echo "Container box left = $boxLeft, right = $boxRight (width = ".($boxRight - $boxLeft).")\n";

// Now let's check the top banner "Panitia" and logos:
// Let's sample down the vertical center x = 204:
echo "\nCenter line x = 204 vertical scan:\n";
for ($y = 0; $y < 350; $y += 5) {
    $rgb = imagecolorat($front, 204, $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    echo "y=$y => rgb($r, $g, $b)\n";
}
