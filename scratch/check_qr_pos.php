<?php

function find_white_boxes($file)
{
    $im = imagecreatefrompng($file);
    $w = imagesx($im);
    $h = imagesy($im);
    // Find white or nearly white pixel clusters
    $whiteCount = 0;
    for ($y = 150; $y < 350; $y++) {
        for ($x = 100; $x < 300; $x++) {
            $c = imagecolorsforindex($im, imagecolorat($im, $x, $y));
            if ($c['red'] > 240 && $c['green'] > 240 && $c['blue'] > 240) {
                $whiteCount++;
            }
        }
    }

    return $whiteCount;
}

echo 'panitia_1 (6193fbbe) white pixels in 150..350: '.find_white_boxes('scratch/panitia_1.png')."\n";
echo 'panitia_2 (213d1826) white pixels in 150..350: '.find_white_boxes('scratch/panitia_2.png')."\n";
