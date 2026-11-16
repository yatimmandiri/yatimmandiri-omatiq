<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$files = glob($dir.'media_1794554817*.png');

foreach ($files as $f) {
    $im = imagecreatefrompng($f);
    // Crop title area (e.g. y=50..120, x=50..358)
    $crop = imagecreatetruecolor(308, 120);
    imagecopy($crop, $im, 0, 0, 50, 40, 308, 120);
    $outName = 'scratch/title_'.basename($f);
    imagepng($crop, $outName);
    echo basename($f)." title cropped to $outName\n";
}
