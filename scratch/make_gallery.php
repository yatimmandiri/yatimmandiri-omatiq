<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$six = [
    'media_1794554817791_1b8f3562.png',
    'media_1794554817796_83d00cd5.png',
    'media_1794554817818_b72dbf2a.png',
    'media_1794554817846_fe6706b8.png',
    'media_1794554817858_3ae89431.png',
    'media_1794554817867_01639dbf.png',
];

$thumbW = 204;
$thumbH = 324;
$cols = 3;
$rows = 2;
$canvas = imagecreatetruecolor($thumbW * $cols, $thumbH * $rows);

foreach ($six as $i => $f) {
    $src = imagecreatefrompng($dir.$f);
    $x = ($i % $cols) * $thumbW;
    $y = intval($i / $cols) * $thumbH;
    imagecopyresampled($canvas, $src, $x, $y, 0, 0, $thumbW, $thumbH, imagesx($src), imagesy($src));
}

imagepng($canvas, 'scratch/six_gallery.png');
echo "Gallery created at scratch/six_gallery.png\n";
