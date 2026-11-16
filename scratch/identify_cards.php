<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$files = glob($dir.'media_1794554817*.png');

foreach ($files as $f) {
    echo '=== '.basename($f)." ===\n";
    $im = imagecreatefrompng($f);
    // Sample top, middle, bottom colors
    $cTop = imagecolorat($im, 204, 50);
    $cMid = imagecolorat($im, 204, 324);
    $cBot = imagecolorat($im, 204, 600);
    printf("Top: #%06X, Mid: #%06X, Bot: #%06X\n", $cTop & 0xFFFFFF, $cMid & 0xFFFFFF, $cBot & 0xFFFFFF);
}
