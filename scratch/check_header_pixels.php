<?php

function checkLogosInHeader($path, $label)
{
    echo "=== $label ($path) ===\n";
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);

    // Check left half (x: 0..w/2) vs right half (x: w/2..w)
    // Icon omatiq has vibrant teal/cyan (#006A60, #207267, etc.)
    // Icon YM has blue/yellow/green (#0072BC, #F7941E, #8DC63F, etc.)
    $leftNonWhite = 0;
    $rightNonWhite = 0;
    for ($y = 20; $y < $h - 20; $y++) {
        for ($x = 0; $x < (int) ($w / 2); $x++) {
            $c = imagecolorat($im, $x, $y);
            $r = ($c >> 16) & 0xFF;
            $g = ($c >> 8) & 0xFF;
            $b = $c & 0xFF;
            if ($r < 235 || $g < 235 || $b < 235) {
                $leftNonWhite++;
            }
        }
        for ($x = (int) ($w / 2); $x < $w; $x++) {
            $c = imagecolorat($im, $x, $y);
            $r = ($c >> 16) & 0xFF;
            $g = ($c >> 8) & 0xFF;
            $b = $c & 0xFF;
            if ($r < 235 || $g < 235 || $b < 235) {
                $rightNonWhite++;
            }
        }
    }
    echo "Left non-bg pixels: $leftNonWhite, Right non-bg pixels: $rightNonWhite\n";
}

checkLogosInHeader('scratch/header_peserta.png', 'Peserta');
checkLogosInHeader('scratch/header_pendamping.png', 'Pendamping');
checkLogosInHeader('scratch/header_panitia.png', 'Panitia');
