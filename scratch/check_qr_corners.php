<?php

$im = imagecreatefrompng('scratch/raw_pendamping_qr_area.png');
$w = imagesx($im);
$h = imagesy($im);

// Check if the QR in the raw upload has a white background behind it, or if it's placed on the yellow background!
// Let's sample colors across the crop
$corners = [
    'TL' => imagecolorat($im, 5, 5),
    'TR' => imagecolorat($im, $w - 5, 5),
    'BL' => imagecolorat($im, 5, $h - 5),
    'BR' => imagecolorat($im, $w - 5, $h - 5),
    'Center' => imagecolorat($im, (int) ($w / 2), (int) ($h / 2)),
];

foreach ($corners as $pos => $c) {
    printf("%s: #%06X\n", $pos, $c & 0xFFFFFF);
}
