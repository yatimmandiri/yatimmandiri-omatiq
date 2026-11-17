<?php

function scan_header_logos($file, $tag)
{
    $im = imagecreatefrompng($file);
    $w = imagesx($im);
    $h = imagesy($im);
    // Find where non-background pixels are
    $minX = $w;
    $maxX = 0;
    // Check left half (icon-omatiq?) and right half (icon-ym?)
    $leftNonWhite = 0;
    $rightNonWhite = 0;
    for ($y = 10; $y < $h - 10; $y++) {
        for ($x = 0; $x < $w / 2; $x++) {
            $c = imagecolorsforindex($im, imagecolorat($im, $x, $y));
            if ($c['red'] < 235 || $c['green'] < 235 || $c['blue'] < 235) {
                $leftNonWhite++;
            }
        }
        for ($x = intval($w / 2); $x < $w; $x++) {
            $c = imagecolorsforindex($im, imagecolorat($im, $x, $y));
            if ($c['red'] < 235 || $c['green'] < 235 || $c['blue'] < 235) {
                $rightNonWhite++;
            }
        }
    }
    echo "[$tag] Left half colored px: $leftNonWhite, Right half colored px: $rightNonWhite\n";
}

scan_header_logos('scratch/crop_header_peserta.png', 'Peserta Header');
scan_header_logos('scratch/crop_header_pendamping.png', 'Pendamping Header');
