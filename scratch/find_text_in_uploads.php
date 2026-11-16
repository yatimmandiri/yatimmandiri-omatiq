<?php

// Let's inspect where "CP OFF" or "Asal Cabang" exists
$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$files = glob($dir.'*.png');

foreach ($files as $f) {
    $im = @imagecreatefrompng($f);
    if (! $im) {
        continue;
    }
    $w = imagesx($im);
    $h = imagesy($im);

    // Check if this image has non-uniform pixels around y = 50%..70%
    // Let's crop center box (x: 20%..80%, y: 50%..70%)
    $cropX = (int) ($w * 0.15);
    $cropW = (int) ($w * 0.70);
    $cropY = (int) ($h * 0.50);
    $cropH = (int) ($h * 0.20);

    $crop = imagecreatetruecolor($cropW, $cropH);
    imagecopy($crop, $im, 0, 0, $cropX, $cropY, $cropW, $cropH);
    $out = 'scratch/crop_'.basename($f);
    imagepng($crop, $out);
    echo basename($f)." ({$w}x{$h}) center cropped to $out\n";
}
