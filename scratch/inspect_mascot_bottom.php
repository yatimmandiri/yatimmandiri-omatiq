<?php

$im = imagecreatefrompng('public/assets/images/Zakki Amila Atas.png');
$w = imagesx($im);
for ($y = 730; $y <= 755; $y++) {
    $colors = [];
    for ($x = 200; $x < 1200; $x += 10) {
        $rgba = imagecolorat($im, $x, $y);
        $alpha = ($rgba >> 24) & 0x7F;
        if ($alpha < 120) {
            $r = ($rgba >> 16) & 0xFF;
            $g = ($rgba >> 8) & 0xFF;
            $b = $rgba & 0xFF;
            $colors[] = sprintf('#%02x%02x%02x(a=%d)', $r, $g, $b, $alpha);
        }
    }
    echo "y=$y: ".count($colors).' samples: '.implode(' ', array_slice($colors, 0, 5))."\n";
}
