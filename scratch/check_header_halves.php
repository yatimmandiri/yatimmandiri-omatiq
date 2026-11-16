<?php

$im = imagecreatefrompng('scratch/header_pendamping.png');
$w = imagesx($im);
$h = imagesy($im);

// Save left and right
$left = imagecreatetruecolor((int) ($w / 2), $h);
imagecopy($left, $im, 0, 0, 0, 0, (int) ($w / 2), $h);
imagepng($left, 'scratch/header_pendamping_left.png');

$right = imagecreatetruecolor((int) ($w / 2), $h);
imagecopy($right, $im, 0, 0, (int) ($w / 2), 0, (int) ($w / 2), $h);
imagepng($right, 'scratch/header_pendamping_right.png');

echo "Saved header_pendamping_left and right\n";
