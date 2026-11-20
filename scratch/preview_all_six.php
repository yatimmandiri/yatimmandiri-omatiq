<?php

$cards = [
    'Peserta Front' => 'public/assets/images/cards/card-bg-front.png',
    'Peserta Back' => 'public/assets/images/cards/card-bg-back.png',
    'Pendamping Front' => 'public/assets/images/cards/card-chaperone-bg-front.png',
    'Pendamping Back' => 'public/assets/images/cards/card-chaperone-bg-back.png',
    'Panitia Front' => 'public/assets/images/cards/card-committee-bg-front.png',
    'Panitia Back' => 'public/assets/images/cards/card-committee-bg-back.png',
];

$tw = 306; // 1224 / 4
$th = 483; // 1932 / 4
$cols = 6;
$canvas = imagecreatetruecolor($tw * $cols, $th);

$idx = 0;
foreach ($cards as $label => $path) {
    if (file_exists($path)) {
        $im = imagecreatefrompng($path);
        imagecopyresampled($canvas, $im, $idx * $tw, 0, 0, 0, $tw, $th, imagesx($im), imagesy($im));
    }
    $idx++;
}

imagepng($canvas, 'scratch/all_six_current.png');
echo "Saved scratch/all_six_current.png\n";
