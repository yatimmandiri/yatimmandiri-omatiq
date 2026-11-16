<?php

$im = imagecreatefrompng('scratch/raw_uploaded_pendamping_back_hd.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's crop:
// 1. The QR code area in the raw upload (x: 270..950, y: 700..1330)
$cropQR = imagecreatetruecolor(680, 630);
imagecopy($cropQR, $im, 0, 0, 272, 700, 680, 630);
imagepng($cropQR, 'scratch/raw_pendamping_qr_area.png');

// 2. The area between Zakki and QR (x: 200..350, y: 750..1200)
$cropZakkiEdge = imagecreatetruecolor(200, 450);
imagecopy($cropZakkiEdge, $im, 0, 0, 180, 750, 200, 450);
imagepng($cropZakkiEdge, 'scratch/raw_zakki_edge.png');

echo "Saved raw_pendamping_qr_area.png and raw_zakki_edge.png\n";
