<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$files = glob($dir.'media_1794554817*.png');

foreach ($files as $f) {
    $info = getimagesize($f);
    echo basename($f)." => {$info[0]}x{$info[1]} (".round(filesize($f) / 1024, 1)." KB)\n";
}
