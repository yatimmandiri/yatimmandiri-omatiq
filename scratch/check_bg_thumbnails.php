<?php

// Check bg-pendamping.png vs card-chaperone-bg-back.png
$bgP = imagecreatefrompng('public/assets/images/bg-pendamping.png');
echo 'bg-pendamping.png size: '.imagesx($bgP).'x'.imagesy($bgP)."\n";

// Let's create a thumbnail 300x400 of bg-pendamping.png
$thumb = imagecreatetruecolor(300, 400);
imagecopyresampled($thumb, $bgP, 0, 0, 0, 0, 300, 400, imagesx($bgP), imagesy($bgP));
imagepng($thumb, 'scratch/thumb_bg_pendamping_full.png');

$bgPan = imagecreatefrompng('public/assets/images/bg-panitia.png');
echo 'bg-panitia.png size: '.imagesx($bgPan).'x'.imagesy($bgPan)."\n";
$thumb2 = imagecreatetruecolor(300, 400);
imagecopyresampled($thumb2, $bgPan, 0, 0, 0, 0, 300, 400, imagesx($bgPan), imagesy($bgPan));
imagepng($thumb2, 'scratch/thumb_bg_panitia_full.png');

$bgPes = imagecreatefrompng('public/assets/images/bg-peserta.png');
echo 'bg-peserta.png size: '.imagesx($bgPes).'x'.imagesy($bgPes)."\n";
$thumb3 = imagecreatetruecolor(300, 225);
imagecopyresampled($thumb3, $bgPes, 0, 0, 0, 0, 300, 225, imagesx($bgPes), imagesy($bgPes));
imagepng($thumb3, 'scratch/thumb_bg_peserta_full.png');

echo "Saved thumbnails of bg-*\n";
