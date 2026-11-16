<?php

foreach ([
    'peserta' => 'public/assets/images/cards/card-bg-front.png',
    'pendamping' => 'public/assets/images/cards/card-chaperone-bg-front.png',
    'panitia' => 'public/assets/images/cards/card-committee-bg-front.png',
] as $type => $path) {
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);
    // Crop header area (x: 350..874, y: 70..280)
    $crop = imagecreatetruecolor(524, 210);
    imagecopy($crop, $im, 0, 0, 350, 70, 524, 210);
    imagepng($crop, "scratch/header_{$type}.png");
    echo "Saved scratch/header_{$type}.png\n";
}
