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

// Let's create a combined contact sheet or inspect colors / text
foreach ($six as $f) {
    $im = imagecreatefrompng($dir.$f);
    $w = imagesx($im);
    $h = imagesy($im);
    // Sample a few pixels to know dominant color and top/bottom
    // Top center color (y = 50)
    $cTop = imagecolorat($im, intval($w / 2), 50);
    $rgbTop = imagecolorsforindex($im, $cTop);
    // Mid center color (y = h/2)
    $cMid = imagecolorat($im, intval($w / 2), intval($h / 2));
    $rgbMid = imagecolorsforindex($im, $cMid);
    // Bottom center color (y = h - 50)
    $cBot = imagecolorat($im, intval($w / 2), $h - 50);
    $rgbBot = imagecolorsforindex($im, $cBot);

    echo sprintf("%s: Top RGB(%3d,%3d,%3d) Mid RGB(%3d,%3d,%3d) Bot RGB(%3d,%3d,%3d)\n",
        $f,
        $rgbTop['red'], $rgbTop['green'], $rgbTop['blue'],
        $rgbMid['red'], $rgbMid['green'], $rgbMid['blue'],
        $rgbBot['red'], $rgbBot['green'], $rgbBot['blue']
    );
}
