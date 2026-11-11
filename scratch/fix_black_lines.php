<?php

function removeBlackBorders($path)
{
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);

    echo "Processing $path ({$w}x{$h})...\n";

    // Top border removal: copy row y=6 up to y=0..5
    for ($y = 0; $y < 6; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $c = imagecolorat($im, $x, 6);
            imagesetpixel($im, $x, $y, $c);
        }
    }

    // Bottom border removal: copy row y=1937 down to y=1938..1943
    for ($y = 1938; $y < $h; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $c = imagecolorat($im, $x, 1937);
            imagesetpixel($im, $x, $y, $c);
        }
    }

    imagepng($im, $path);
    echo "Saved $path without black borders.\n";
}

removeBlackBorders('public/assets/images/cards/card-bg-front.png');
removeBlackBorders('public/assets/images/cards/card-bg-back.png');
