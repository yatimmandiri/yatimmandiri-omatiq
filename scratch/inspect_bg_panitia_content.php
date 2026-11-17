<?php

$im = imagecreatefrompng('public/assets/images/bg-panitia.png');
$w = imagesx($im);
$h = imagesy($im);
echo "bg-panitia.png: {$w}x{$h}\n";

// Sample colors from top to bottom
for ($y = 50; $y < $h; $y += 150) {
    $cMid = imagecolorsforindex($im, imagecolorat($im, intval($w / 2), $y));
    $cL = imagecolorsforindex($im, imagecolorat($im, 50, $y));
    $cR = imagecolorsforindex($im, imagecolorat($im, $w - 50, $y));
    echo sprintf("y=%4d: Mid RGB(%3d,%3d,%3d), L RGB(%3d,%3d,%3d), R RGB(%3d,%3d,%3d)\n",
        $y,
        $cMid['red'], $cMid['green'], $cMid['blue'],
        $cL['red'], $cL['green'], $cL['blue'],
        $cR['red'], $cR['green'], $cR['blue']
    );
}

// Generate a thumbnail of bg-panitia.png to scratch/thumb_bg_panitia_full.png
$thumb = imagecreatetruecolor(271, 362);
imagecopyresampled($thumb, $im, 0, 0, 0, 0, 271, 362, $w, $h);
imagepng($thumb, 'scratch/thumb_bg_panitia_full.png');
echo "Saved scratch/thumb_bg_panitia_full.png\n";
