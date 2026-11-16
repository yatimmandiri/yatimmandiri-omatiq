<?php

$files = [
    'chaperone_front' => 'public/assets/images/cards/card-chaperone-bg-front.png',
    'chaperone_back' => 'public/assets/images/cards/card-chaperone-bg-back.png',
    'peserta_front' => 'public/assets/images/cards/card-bg-front.png',
    'peserta_back' => 'public/assets/images/cards/card-bg-back.png',
    'panitia_front' => 'public/assets/images/cards/card-committee-bg-front.png',
    'panitia_back' => 'public/assets/images/cards/card-committee-bg-back.png',
];

foreach ($files as $name => $path) {
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);
    $thumb = imagecreatetruecolor(300, 473);
    imagecopyresampled($thumb, $im, 0, 0, 0, 0, 300, 473, $w, $h);
    imagepng($thumb, "scratch/thumb_new_{$name}.png");
    echo "Saved scratch/thumb_new_{$name}.png\n";
}
