<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$files = scandir($dir);
foreach ($files as $f) {
    if (str_ends_with($f, '.png') || str_ends_with($f, '.jpg')) {
        $sz = @getimagesize($dir.$f);
        if ($sz) {
            echo sprintf("%-35s %4dx%-4d %s\n", $f, $sz[0], $sz[1], $sz['mime']);
        }
    }
}
