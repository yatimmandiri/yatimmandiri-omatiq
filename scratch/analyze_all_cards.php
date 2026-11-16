<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';

$cards = [
    'peserta' => [
        'front' => 'media_1794554817796_83d00cd5.png',
        'back' => 'media_1794554817818_b72dbf2a.png',
        'color' => '#134e45', // brand emerald
    ],
    'pendamping' => [
        'front' => 'media_1794554817846_fe6706b8.png',
        'back' => 'media_1794554817867_01639dbf.png',
        'color' => '#7a6400', // gold
    ],
    'panitia' => [
        'front' => 'media_1794554817791_1b8f3562.png',
        'back' => 'media_1794554817858_3ae89431.png',
        'color' => '#00555f', // dark teal
    ],
];

foreach ($cards as $type => $info) {
    echo "========================================================\n";
    echo 'CARD TYPE: '.strtoupper($type)."\n";
    echo "========================================================\n";

    $fPath = $dir.$info['front'];
    $bPath = $dir.$info['back'];

    $imF = imagecreatefrompng($fPath);
    $imB = imagecreatefrompng($bPath);

    echo 'Front size: '.imagesx($imF).'x'.imagesy($imF)."\n";
    echo 'Back size:  '.imagesx($imB).'x'.imagesy($imB)."\n";

    // Check Front Box location (where the dummy text is)
    // Sample vertical strip in center
    $w = imagesx($imF);
    $h = imagesy($imF);
    echo "Front center strip samples:\n";
    for ($y = (int) ($h * 0.45); $y <= (int) ($h * 0.75); $y += (int) ($h * 0.05)) {
        $c = imagecolorat($imF, (int) ($w / 2), $y);
        printf("  y=%3d (%.1f%%): #%06X\n", $y, ($y / $h) * 100, $c & 0xFFFFFF);
    }
}
