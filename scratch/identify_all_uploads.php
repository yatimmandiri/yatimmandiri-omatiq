<?php

// Let's inspect the 6 images:
// media_1794554817791_1b8f3562.png
// media_1794554817796_83d00cd5.png
// media_1794554817818_b72dbf2a.png
// media_1794554817846_fe6706b8.png
// media_1794554817858_3ae89431.png
// media_1794554817867_01639dbf.png

// and also media_1794464026354_213d1826.png and media_1794464026354_6193fbbe.png
// and media_1794452501114_7860d125.png and media_1794452501114_f6cbe61c.png

$checkList = [
    'media_1794452501114_f6cbe61c.png' => 'Upload 12 Nov Chaperone 1',
    'media_1794452501114_7860d125.png' => 'Upload 12 Nov Chaperone 2',
    'media_1794464026354_213d1826.png' => 'Upload 12 Nov Committee 1',
    'media_1794464026354_6193fbbe.png' => 'Upload 12 Nov Committee 2',
    'media_1794554817791_1b8f3562.png' => 'Upload 13 Nov Image 1',
    'media_1794554817796_83d00cd5.png' => 'Upload 13 Nov Image 2',
    'media_1794554817818_b72dbf2a.png' => 'Upload 13 Nov Image 3',
    'media_1794554817846_fe6706b8.png' => 'Upload 13 Nov Image 4',
    'media_1794554817858_3ae89431.png' => 'Upload 13 Nov Image 5',
    'media_1794554817867_01639dbf.png' => 'Upload 13 Nov Image 6',
];

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
foreach ($checkList as $filename => $label) {
    $im = imagecreatefrompng($dir.$filename);
    $w = imagesx($im);
    $h = imagesy($im);
    // Let's sample colors:
    // Header text area (y: 60..130)
    // Box area (y: 330..430)
    // QR / Mascot area (y: 250..420)
    echo "=== $filename ($label) ===\n";
    // Check if y: 350 has white/cream box or QR code
    $cTop = imagecolorat($im, (int) ($w / 2), 80);
    $cMid = imagecolorat($im, (int) ($w / 2), 350);
    $cBot = imagecolorat($im, (int) ($w / 2), 600);
    printf("  y=80: #%06X, y=350: #%06X, y=600: #%06X\n", $cTop & 0xFFFFFF, $cMid & 0xFFFFFF, $cBot & 0xFFFFFF);
}
