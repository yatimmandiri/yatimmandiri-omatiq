<?php

function inspectImageTextAndElements($path, $label)
{
    echo "=== $label ($path) ===\n";
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);

    // Check non-background pixels
    // Let's check sample points
    $bgCol = imagecolorat($im, 10, 10);
    echo 'Background sample: #'.str_pad(dechex($bgCol & 0xFFFFFF), 6, '0', STR_PAD_LEFT)."\n";
}

inspectImageTextAndElements('scratch/pendamping_front_top.png', 'Pendamping Front Top');
inspectImageTextAndElements('scratch/pendamping_front_mid.png', 'Pendamping Front Mid');
inspectImageTextAndElements('scratch/pendamping_back_qr.png', 'Pendamping Back QR');
