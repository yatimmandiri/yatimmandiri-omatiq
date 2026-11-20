<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';

function describeImage($path, $label)
{
    echo "========================================================\n";
    echo "LABEL: $label (".basename($path).")\n";
    echo "========================================================\n";
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);

    // Sample at 10%, 25%, 40%, 55%, 70%, 85%, 95% height in center
    $samples = [
        'Top bar (y=25)' => 25,
        'Header logo/title (y=80)' => 80,
        'Title OMATIQ (y=160)' => 160,
        'Upper mid (y=260)' => 260,
        'Center data/QR (y=360)' => 360,
        'Lower mid (y=470)' => 470,
        'Sponsor/Bottom (y=570)' => 570,
        'Footer (y=620)' => 620,
    ];

    foreach ($samples as $pos => $y) {
        $cL = imagecolorat($im, 50, $y);
        $cM = imagecolorat($im, (int) ($w / 2), $y);
        $cR = imagecolorat($im, $w - 50, $y);
        printf("%-26s: L=#%06X | M=#%06X | R=#%06X\n", $pos, $cL & 0xFFFFFF, $cM & 0xFFFFFF, $cR & 0xFFFFFF);
    }
}

describeImage($dir.'media_1794464026354_213d1826.png', 'Panitia Nov12 #1 (213d1826)');
describeImage($dir.'media_1794464026354_6193fbbe.png', 'Panitia Nov12 #2 (6193fbbe)');
describeImage($dir.'media_1794554817791_1b8f3562.png', 'Panitia Nov13 #1 (1b8f3562)');
describeImage($dir.'media_1794554817858_3ae89431.png', 'Panitia Nov13 #2 (3ae89431)');
