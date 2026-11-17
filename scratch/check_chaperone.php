<?php

$uploadDir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$chaperoneFiles = [
    '7860d125' => 'media_1794452501114_7860d125.png',
    'f6cbe61c' => 'media_1794452501114_f6cbe61c.png',
    'fe6706b8' => 'media_1794554817846_fe6706b8.png',
    '01639dbf' => 'media_1794554817867_01639dbf.png',
];

foreach ($chaperoneFiles as $k => $f) {
    $im = imagecreatefrompng($uploadDir.$f);
    // Find text or features
    // In Chaperone FRONT, there is a data box at y=350 with Name & NIK
    // In Chaperone BACK, there is a QR code at y=250..350 with Zakki & Amila
    // Let's check color at x=204, y=280 and y=360
    $c280 = imagecolorsforindex($im, imagecolorat($im, 204, 280));
    $c360 = imagecolorsforindex($im, imagecolorat($im, 204, 360));
    $cL360 = imagecolorsforindex($im, imagecolorat($im, 50, 360)); // Zakki on left?
    echo sprintf("%s: y=280 RGB(%3d,%3d,%3d), y=360 RGB(%3d,%3d,%3d), Left=RGB(%3d,%3d,%3d)\n",
        $k,
        $c280['red'], $c280['green'], $c280['blue'],
        $c360['red'], $c360['green'], $c360['blue'],
        $cL360['red'], $cL360['green'], $cL360['blue']
    );
}
