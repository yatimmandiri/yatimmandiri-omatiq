<?php

$files = [
    'Omatiq 2026 - Background Cerah.png' => 'public/assets/images/Omatiq 2026 - Background Cerah.png',
    'Amila Window Hi.png' => 'public/assets/images/Amila Window Hi.png',
    'Zakki Window Hi.png' => 'public/assets/images/Zakki Window Hi.png',
    'Zakki Amila Atas.png' => 'public/assets/images/Zakki Amila Atas.png',
    'Tulisan Omatiq.png' => 'public/assets/images/Tulisan Omatiq.png',
    'card-bg-front.png' => 'public/assets/images/cards/card-bg-front.png',
    'card-bg-back.png' => 'public/assets/images/cards/card-bg-back.png',
    'raw_back' => 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798570_9e7d3f1e.png',
    'raw_front' => 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798593_73231e09.png',
];

foreach ($files as $name => $path) {
    if (file_exists($path)) {
        $info = getimagesize($path);
        echo "$name: {$info[0]} x {$info[1]} ({$info['mime']})\n";
    } else {
        echo "$name: NOT FOUND\n";
    }
}
