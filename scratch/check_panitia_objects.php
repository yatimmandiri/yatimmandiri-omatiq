<?php

function checkObjects($path, $label)
{
    echo "=== $label ($path) ===\n";
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);

    // Check if there is text "Panitia" or "OMATIQ"
    // Let's find white pixels (text on teal background)
    $whitePixels = 0;
    for ($y = 0; $y < $h; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $c = imagecolorat($im, $x, $y) & 0xFFFFFF;
            if ($c > 0xF0F0F0) {
                $whitePixels++;
            }
        }
    }
    echo "White pixels: $whitePixels\n";
}

checkObjects('scratch/panitia_1_top.png', 'Panitia 1 Top');
checkObjects('scratch/panitia_2_top.png', 'Panitia 2 Top');
checkObjects('scratch/panitia_1_mid.png', 'Panitia 1 Mid');
checkObjects('scratch/panitia_2_mid.png', 'Panitia 2 Mid');
checkObjects('scratch/panitia_1_bot.png', 'Panitia 1 Bot');
checkObjects('scratch/panitia_2_bot.png', 'Panitia 2 Bot');
