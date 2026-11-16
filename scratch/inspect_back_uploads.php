<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';

// 1. Peserta Back: media_1794554817818_b72dbf2a.png
// 2. Pendamping Back: media_1794554817867_01639dbf.png
// 3. Panitia Back: media_1794554817858_3ae89431.png

foreach ([
    'peserta_back' => 'media_1794554817818_b72dbf2a.png',
    'pendamping_back' => 'media_1794554817867_01639dbf.png',
    'panitia_back' => 'media_1794554817858_3ae89431.png',
] as $label => $file) {
    echo "=== $label ($file) ===\n";
    $im = imagecreatefrompng($dir.$file);
    $w = imagesx($im);
    $h = imagesy($im);
    echo "Dimensions: {$w}x{$h}\n";

    // Check what is in the center area (x: 100..308, y: 200..450)
    // In 408x648, y: 220..420 is QR area
    $crop = imagecreatetruecolor(408, 300);
    imagecopy($crop, $im, 0, 0, 0, 180, 408, 300);
    imagepng($crop, "scratch/{$label}_center.png");
    echo "Saved scratch/{$label}_center.png\n";
}
