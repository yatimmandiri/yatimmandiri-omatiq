<?php

// Let's crop the box area in card-chaperone-bg-front.png
// The name box is around y = 53% of 1932 = y: 950..1300, x: 100..1124
$im = imagecreatefrompng('public/assets/images/cards/card-chaperone-bg-front.png');
$w = imagesx($im);
$h = imagesy($im);
echo "card-chaperone-bg-front: {$w}x{$h}\n";

$cropY = (int) ($h * 0.48);
$cropH = (int) ($h * 0.22);
$crop = imagecreatetruecolor($w, $cropH);
imagecopy($crop, $im, 0, 0, 0, $cropY, $w, $cropH);
imagepng($crop, 'scratch/crop_chaperone_front_box.png');
echo "Saved scratch/crop_chaperone_front_box.png (y: $cropY to ".($cropY + $cropH).")\n";
