<?php

foreach (['peserta_back', 'pendamping_back', 'panitia_back'] as $label) {
    echo "=== $label ===\n";
    $im = imagecreatefrompng("scratch/{$label}_center.png");
    $w = imagesx($im);
    $h = imagesy($im);

    // Sample colors in the middle (x=204, y=50..250)
    for ($y = 20; $y < $h - 20; $y += 30) {
        $c = imagecolorat($im, 204, $y);
        printf("  y=%3d: #%06X\n", $y, $c & 0xFFFFFF);
    }
}
