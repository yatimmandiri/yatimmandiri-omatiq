<?php

$uploadDir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$pesertaFiles = [
    '86309bdb' => 'media_1794196732250_86309bdb.png',
    'ef0bee6a' => 'media_1794196732329_ef0bee6a.png',
    '83d00cd5' => 'media_1794554817796_83d00cd5.png',
    'b72dbf2a' => 'media_1794554817818_b72dbf2a.png',
];

foreach ($pesertaFiles as $k => $f) {
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
