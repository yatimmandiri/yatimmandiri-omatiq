<?php

foreach (['bg-pendamping.png', 'bg-panitia.png', 'bg-peserta.png'] as $name) {
    $path = "public/assets/images/$name";
    if (file_exists($path)) {
        $im = imagecreatefrompng($path);
        echo "=== $name (".imagesx($im).'x'.imagesy($im).") ===\n";
        // Check corners and center
        $w = imagesx($im);
        $h = imagesy($im);
        $cTopLeft = imagecolorat($im, 0, 0);
        $cMid = imagecolorat($im, (int) ($w / 2), (int) ($h / 2));
        $cBottomRight = imagecolorat($im, $w - 1, $h - 1);
        printf("TL: #%06X, Mid: #%06X, BR: #%06X\n", $cTopLeft & 0xFFFFFF, $cMid & 0xFFFFFF, $cBottomRight & 0xFFFFFF);
    }
}
