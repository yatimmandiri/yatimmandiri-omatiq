<?php

$im = imagecreatefrompng('public/assets/images/cards/card-chaperone-bg-back.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's create a thumbnail 300x473 of card-chaperone-bg-back.png
$thumb = imagecreatetruecolor(300, 473);
imagecopyresampled($thumb, $im, 0, 0, 0, 0, 300, 473, $w, $h);
imagepng($thumb, 'scratch/thumb_current_chaperone_back.png');

$imF = imagecreatefrompng('public/assets/images/cards/card-chaperone-bg-front.png');
$thumbF = imagecreatetruecolor(300, 473);
imagecopyresampled($thumbF, $imF, 0, 0, 0, 0, 300, 473, imagesx($imF), imagesy($imF));
imagepng($thumbF, 'scratch/thumb_current_chaperone_front.png');

echo "Saved thumbnails\n";
