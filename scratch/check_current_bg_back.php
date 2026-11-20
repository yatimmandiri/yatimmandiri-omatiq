<?php

$files = [
    'public/assets/images/cards/card-bg-back.png',
    'public/assets/images/cards/card-chaperone-bg-back.png',
    'public/assets/images/cards/card-committee-bg-back.png',
];

foreach ($files as $f) {
    if (! file_exists($f)) {
        echo "$f does not exist\n";

        continue;
    }
    $im = imagecreatefrompng($f);
    $w = imagesx($im);
    $h = imagesy($im);
    echo "=== $f ($w x $h) ===\n";
    // Check pixel at center y=1000, x=w/2
    $c = imagecolorsforindex($im, imagecolorat($im, intval($w / 2), 1000));
    echo "Center y=1000: RGB({$c['red']},{$c['green']},{$c['blue']})\n";
    // Check at x=200, y=1000
    $cL = imagecolorsforindex($im, imagecolorat($im, 200, 1000));
    echo "x=200, y=1000: RGB({$cL['red']},{$cL['green']},{$cL['blue']})\n";
    // Check at x=w/2, y=600
    $cTop = imagecolorsforindex($im, imagecolorat($im, intval($w / 2), 600));
    echo "x=w/2, y=600: RGB({$cTop['red']},{$cTop['green']},{$cTop['blue']})\n";
}
