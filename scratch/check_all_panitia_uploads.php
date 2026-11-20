<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';

$files = [
    'panitia_nov12_1' => 'media_1794464026354_213d1826.png',
    'panitia_nov12_2' => 'media_1794464026354_6193fbbe.png',
    'panitia_nov13_1' => 'media_1794554817791_1b8f3562.png',
    'panitia_nov13_2' => 'media_1794554817858_3ae89431.png',
];

foreach ($files as $name => $f) {
    if (! file_exists($dir.$f)) {
        echo "$f not found\n";

        continue;
    }
    $im = imagecreatefrompng($dir.$f);
    $w = imagesx($im);
    $h = imagesy($im);
    echo "$name ($f): {$w}x{$h}\n";

    // Save a thumbnail 300x473 to inspect
    $thumb = imagecreatetruecolor(300, 473);
    imagecopyresampled($thumb, $im, 0, 0, 0, 0, 300, 473, $w, $h);
    imagepng($thumb, "scratch/thumb_inspect_{$name}.png");
}

echo "Thumbnails saved to scratch/thumb_inspect_panitia_*.png\n";
