<?php

$files = [
    'public/assets/images/bg-pendamping.png',
    'public/assets/images/bg-peserta.png',
    'public/assets/images/bg-panitia.png',
    'public/assets/images/cards/card-bg-front.png',
    'public/assets/images/cards/card-bg-back.png',
    'public/assets/images/cards/card-chaperone-bg-front.png',
    'public/assets/images/cards/card-chaperone-bg-back.png',
    'public/assets/images/cards/card-committee-bg-front.png',
    'public/assets/images/cards/card-committee-bg-back.png',
];

foreach ($files as $f) {
    if (file_exists($f)) {
        $info = getimagesize($f);
        echo "$f => {$info[0]}x{$info[1]} (".round(filesize($f) / 1024, 1)." KB)\n";
    } else {
        echo "$f => NOT FOUND\n";
    }
}
