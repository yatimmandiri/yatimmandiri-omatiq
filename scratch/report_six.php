<?php

$cards = [
    'Peserta Front' => 'public/assets/images/cards/card-bg-front.png',
    'Peserta Back' => 'public/assets/images/cards/card-bg-back.png',
    'Pendamping Front' => 'public/assets/images/cards/card-chaperone-bg-front.png',
    'Pendamping Back' => 'public/assets/images/cards/card-chaperone-bg-back.png',
    'Panitia Front' => 'public/assets/images/cards/card-committee-bg-front.png',
    'Panitia Back' => 'public/assets/images/cards/card-committee-bg-back.png',
];

foreach ($cards as $name => $path) {
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);
    // Header (y=150)
    $cH = imagecolorsforindex($im, imagecolorat($im, 612, 150));
    // Mid (y=1000)
    $cM = imagecolorsforindex($im, imagecolorat($im, 612, 1000));
    // Left Mascot area (x=200, y=1100)
    $cMasL = imagecolorsforindex($im, imagecolorat($im, 200, 1100));
    echo sprintf("%-18s Header RGB(%3d,%3d,%3d) Mid RGB(%3d,%3d,%3d) MascL RGB(%3d,%3d,%3d)\n",
        $name,
        $cH['red'], $cH['green'], $cH['blue'],
        $cM['red'], $cM['green'], $cM['blue'],
        $cMasL['red'], $cMasL['green'], $cMasL['blue']
    );
}
