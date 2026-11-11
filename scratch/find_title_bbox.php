<?php

$rawF = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798593_73231e09.png');
// Search for dark / colored text pixels between y=160 and y=280
$found = [];
for ($y = 160; $y < 280; $y++) {
    for ($x = 40; $x < 368; $x++) {
        $c = imagecolorat($rawF, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // background is R > 230, G > 250, B > 250
        if ($r < 220 || $g < 240 || $b < 240) {
            $found[] = ['x' => $x, 'y' => $y];
        }
    }
}
if ($found) {
    echo 'Raw front title bbox: x='.min(array_column($found, 'x')).'..'.max(array_column($found, 'x')).
         ', y='.min(array_column($found, 'y')).'..'.max(array_column($found, 'y'))."\n";
}
// Now for raw back:
$rawB = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798570_9e7d3f1e.png');
$foundB = [];
for ($y = 90; $y < 200; $y++) {
    for ($x = 40; $x < 368; $x++) {
        $c = imagecolorat($rawB, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r < 220 || $g < 240 || $b < 240) {
            $foundB[] = ['x' => $x, 'y' => $y];
        }
    }
}
if ($foundB) {
    echo 'Raw back title bbox: x='.min(array_column($foundB, 'x')).'..'.max(array_column($foundB, 'x')).
         ', y='.min(array_column($foundB, 'y')).'..'.max(array_column($foundB, 'y'))."\n";
}
