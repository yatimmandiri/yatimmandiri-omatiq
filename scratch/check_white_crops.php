<?php

function analyze_crop($path, $label)
{
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);
    $whitePx = 0;
    for ($y = 0; $y < $h; $y++) {
        for ($x = 200; $x < $w - 200; $x++) { // Check center
            $c = imagecolorsforindex($im, imagecolorat($im, $x, $y));
            if ($c['red'] > 245 && $c['green'] > 245 && $c['blue'] > 245) {
                $whitePx++;
            }
        }
    }
    echo "[$label] White pixels in center (x:200..w-200): $whitePx\n";
}

analyze_crop('scratch/crop_check_pes_back.png', 'Peserta Back');
analyze_crop('scratch/crop_check_pen_back.png', 'Pendamping Back');
