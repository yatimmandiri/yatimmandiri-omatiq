<?php

$files = [
    'card-bg-front.png',
    'card-bg-back.png',
    'card-chaperone-bg-front.png',
    'card-chaperone-bg-back.png',
    'bg-panitia.png',
];

foreach ($files as $f) {
    $path = (strpos($f, 'bg-') === 0) ? 'public/assets/images/'.$f : 'public/assets/images/cards/'.$f;
    if (! file_exists($path)) {
        continue;
    }
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);
    $cTop = imagecolorsforindex($im, imagecolorat($im, intval($w / 2), 0));
    $cBot = imagecolorsforindex($im, imagecolorat($im, intval($w / 2), $h - 1));
    echo sprintf("%-30s Top: RGB(%3d,%3d,%3d), Bot: RGB(%3d,%3d,%3d)\n",
        $f,
        $cTop['red'], $cTop['green'], $cTop['blue'],
        $cBot['red'], $cBot['green'], $cBot['blue']
    );
}
