<?php

$pairs = [
    'peserta' => [
        'front' => 'media_1794554817796_83d00cd5.png',
        'back' => 'media_1794554817818_b72dbf2a.png',
    ],
    'pendamping' => [
        'front' => 'media_1794554817846_fe6706b8.png',
        'back' => 'media_1794554817867_01639dbf.png',
    ],
    'panitia' => [
        'front' => 'media_1794554817791_1b8f3562.png',
        'back' => 'media_1794554817858_3ae89431.png',
    ],
];

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';

foreach ($pairs as $type => $p) {
    echo "========================================\n";
    echo "TYPE: $type\n";
    echo "========================================\n";

    // Front: crop top logo area (x: 100..308, y: 10..60)
    $imF = imagecreatefrompng($dir.$p['front']);
    $cropTopF = imagecreatetruecolor(408, 100);
    imagecopy($cropTopF, $imF, 0, 0, 0, 0, 408, 100);
    imagepng($cropTopF, "scratch/{$type}_front_top.png");

    // Front: crop middle box area (y: 250..450)
    $cropMidF = imagecreatetruecolor(408, 200);
    imagecopy($cropMidF, $imF, 0, 0, 0, 250, 408, 200);
    imagepng($cropMidF, "scratch/{$type}_front_mid.png");

    // Back: crop top area (y: 0..150)
    $imB = imagecreatefrompng($dir.$p['back']);
    $cropTopB = imagecreatetruecolor(408, 150);
    imagecopy($cropTopB, $imB, 0, 0, 0, 0, 408, 150);
    imagepng($cropTopB, "scratch/{$type}_back_top.png");

    // Back: crop QR area (y: 180..460)
    $cropMidB = imagecreatetruecolor(408, 280);
    imagecopy($cropMidB, $imB, 0, 0, 0, 180, 408, 280);
    imagepng($cropMidB, "scratch/{$type}_back_qr.png");

    echo "Saved crops for $type\n";
}
