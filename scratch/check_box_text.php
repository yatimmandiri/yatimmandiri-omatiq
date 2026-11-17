<?php

$front = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png');

// In crop_front_box.png (y: 340 to 480):
// Let's scan y for dark text colors:
echo "Scanning text inside box:\n";
for ($y = 350; $y < 460; $y += 2) {
    $darkCount = 0;
    for ($x = 50; $x < 360; $x++) {
        $rgb = imagecolorat($front, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        // Dark text (teal / dark blue / green: #042f2e or similar)
        if ($r < 50 && $g < 100 && $b < 110) {
            $darkCount++;
        }
    }
    if ($darkCount > 10) {
        echo "y=$y has $darkCount dark text pixels\n";
    }
}
