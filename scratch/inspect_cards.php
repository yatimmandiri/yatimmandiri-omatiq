<?php

$imB = imagecreatefrompng('public/assets/images/cards/card-bg-back.png');
$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');

imagepng(imagescale($imB, 400), 'scratch/inspect_back.png');
imagepng(imagescale($imF, 400), 'scratch/inspect_front.png');

echo "Saved inspect_back.png and inspect_front.png\n";
