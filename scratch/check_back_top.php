<?php

$imB = imagecreatefrompng('public/assets/images/cards/card-bg-back.png');

// Check top of card-bg-back.png
// The back card has "Olimpiade Matematika dan Qur'an OMATIQ 2026 Building Future Innovator"
// Does it have the YM logo at the top?
// Let's check y=100..300, x=100..1100
$cropBackTop = imagecrop($imB, ['x' => 100, 'y' => 50, 'width' => 1024, 'height' => 300]);
imagepng($cropBackTop, 'scratch/crop_back_top.png');
echo "Saved scratch/crop_back_top.png\n";
