<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';

foreach ([
    'peserta' => 'media_1794554817818_b72dbf2a.png',
    'pendamping' => 'media_1794554817867_01639dbf.png',
    'panitia' => 'media_1794554817858_3ae89431.png',
] as $type => $filename) {
    echo "=== Inspecting $type ($filename) ===\n";
    $im = imagecreatefrompng($dir.$filename);
    $w = imagesx($im);
    $h = imagesy($im);

    // Check what is at:
    // 1. Top (y: 20..100)
    // 2. Title (y: 100..180)
    // 3. Mascots / QR (y: 220..420)
    // 4. Cube / bottom (y: 430..648)

    // Let's create an HD upscale (1224x1944) of the original uploaded image to see its raw beauty
    $hd = imagecreatetruecolor(1224, 1944);
    imagecopyresampled($hd, $im, 0, 0, 0, 0, 1224, 1944, $w, $h);
    imagepng($hd, "scratch/raw_uploaded_{$type}_back_hd.png");
    echo "Saved scratch/raw_uploaded_{$type}_back_hd.png\n";
}
