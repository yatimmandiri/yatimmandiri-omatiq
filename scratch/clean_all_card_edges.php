<?php

$files = [
    'public/assets/images/cards/card-bg-front.png',
    'public/assets/images/cards/card-bg-back.png',
    'public/assets/images/cards/card-chaperone-bg-front.png',
    'public/assets/images/cards/card-chaperone-bg-back.png',
];

foreach ($files as $f) {
    if (! file_exists($f)) {
        continue;
    }
    $im = imagecreatefrompng($f);
    $w = imagesx($im);
    $h = imagesy($im);
    for ($y = 0; $y < 6; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $c = imagecolorat($im, $x, 7);
            imagesetpixel($im, $x, $y, $c);
        }
    }
    for ($y = $h - 6; $y < $h; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $c = imagecolorat($im, $x, $h - 8);
            imagesetpixel($im, $x, $y, $c);
        }
    }
    imagepng($im, $f);
    echo "Clamped edges for $f\n";
}
