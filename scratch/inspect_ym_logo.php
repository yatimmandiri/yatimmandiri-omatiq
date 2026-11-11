<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');
$imYM = imagecreatefrompng('public/assets/images/icon-ym.png');

echo 'Front Card Size: '.imagesx($imF).'x'.imagesy($imF)."\n";
echo 'icon-ym.png Size: '.imagesx($imYM).'x'.imagesy($imYM)."\n";

// Let's crop the top logo area of the front card
// The card has targetW=1224, targetH=1944.
// Where is the YM logo on the front card?
// Let's crop x=200..600, y=100..400
$cropTop = imagecrop($imF, ['x' => 100, 'y' => 50, 'width' => 600, 'height' => 350]);
imagepng($cropTop, 'scratch/crop_top_logos.png');
echo "Saved scratch/crop_top_logos.png\n";
