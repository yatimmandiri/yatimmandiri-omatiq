<?php

$uploadDir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$panitiaFiles = [
    '6193fbbe' => 'media_1794464026354_6193fbbe.png',
    '213d1826' => 'media_1794464026354_213d1826.png',
    '3ae89431' => 'media_1794554817858_3ae89431.png',
    '1b8f3562' => 'media_1794554817791_1b8f3562.png',
];

foreach ($panitiaFiles as $k => $f) {
    $im = imagecreatefrompng($uploadDir.$f);
    $c280 = imagecolorsforindex($im, imagecolorat($im, 204, 280));
    $c360 = imagecolorsforindex($im, imagecolorat($im, 204, 360));
    $cL360 = imagecolorsforindex($im, imagecolorat($im, 50, 360));
    echo sprintf("%s: y=280 RGB(%3d,%3d,%3d), y=360 RGB(%3d,%3d,%3d), Left=RGB(%3d,%3d,%3d)\n",
        $k,
        $c280['red'], $c280['green'], $c280['blue'],
        $c360['red'], $c360['green'], $c360['blue'],
        $cL360['red'], $cL360['green'], $cL360['blue']
    );
}
