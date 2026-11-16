<?php

$im = imagecreatefrompng('public/assets/images/Omatiq 2026 - Background Cerah.png');
$w = imagesx($im);
$h = imagesy($im);
echo "Omatiq 2026 - Background Cerah: {$w}x{$h}\n";

// Sample colors in corners and center
$tl = imagecolorat($im, 10, 10);
$mid = imagecolorat($im, (int) ($w / 2), (int) ($h / 2));
$br = imagecolorat($im, $w - 10, $h - 10);
printf("TL: #%06X, Mid: #%06X, BR: #%06X\n", $tl & 0xFFFFFF, $mid & 0xFFFFFF, $br & 0xFFFFFF);
