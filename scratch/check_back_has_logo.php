<?php

$imB = imagecreatefrompng('public/assets/images/cards/card-bg-back.png');

$pixels = 0;
for ($y = 100; $y < 250; $y++) {
    for ($x = 100; $x < 1124; $x++) {
        $c = imagecolorat($imB, $x, $y) & 0xFFFFFF;
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if (! ($r >= 240 && $g >= 250 && $b >= 250)) {
            $pixels++;
        }
    }
}
echo "Back card non-bg pixels at y=100..250: $pixels\n";
