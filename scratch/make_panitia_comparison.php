<?php

// Build comparison: Current Panitia vs New Perfect Panitia
$oldF = imagecreatefrompng('public/assets/images/cards/card-committee-bg-front.png');
$oldB = imagecreatefrompng('public/assets/images/cards/card-committee-bg-back.png');
$newF = imagecreatefrompng('scratch/test_panitia_front.png');
$newB = imagecreatefrompng('scratch/test_panitia_back.png');

$w = 306; // 1224/4
$h = 483; // 1932/4
$comp = imagecreatetruecolor($w * 4, $h);

imagecopyresampled($comp, $oldF, 0 * $w, 0, 0, 0, $w, $h, 1224, 1932);
imagecopyresampled($comp, $oldB, 1 * $w, 0, 0, 0, $w, $h, 1224, 1932);
imagecopyresampled($comp, $newF, 2 * $w, 0, 0, 0, $w, $h, 1224, 1932);
imagecopyresampled($comp, $newB, 3 * $w, 0, 0, 0, $w, $h, 1224, 1932);

imagepng($comp, 'scratch/panitia_comparison.png');
echo "Saved scratch/panitia_comparison.png\n";
