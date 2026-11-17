<?php

$uploadDir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$list = [
    'fe6706b8' => 'Chaperone FRONT ?',
    '01639dbf' => 'Chaperone BACK ?',
    '83d00cd5' => 'Peserta FRONT ?',
    'b72dbf2a' => 'Peserta BACK ?',
    '3ae89431' => 'Panitia FRONT ?',
    '1b8f3562' => 'Panitia BACK ?',
];

foreach ($list as $hash => $desc) {
    $f = $uploadDir.'media_1794554817'.($hash == '1b8f3562' ? '791_' : ($hash == '83d00cd5' ? '796_' : ($hash == 'b72dbf2a' ? '818_' : ($hash == 'fe6706b8' ? '846_' : ($hash == '3ae89431' ? '858_' : '867_'))))).$hash.'.png';
    $im = imagecreatefrompng($f);
    // Find if it has QR code
    // Check pixel at center y=300 (in 408x648)
    $hasQr = false;
    for ($y = 250; $y <= 350; $y += 20) {
        $c = imagecolorsforindex($im, imagecolorat($im, 204, $y));
        if ($c['red'] > 240 && $c['green'] > 240 && $c['blue'] > 240) {
            $hasQr = true;
            break;
        }
    }
    echo sprintf("%s: %s (has QR: %s)\n", $hash, $desc, $hasQr ? 'YES (BACK)' : 'NO (FRONT)');
}
