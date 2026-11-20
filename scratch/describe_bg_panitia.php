<?php

// Check features of bg-panitia.png
function describe_slice($path, $label)
{
    $im = imagecreatefrompng($path);
    $w = imagesx($im);
    $h = imagesy($im);
    $nonBg = 0;
    // Check if there is any white or text
    for ($y = 0; $y < $h; $y += 5) {
        for ($x = 0; $x < $w; $x += 5) {
            $c = imagecolorsforindex($im, imagecolorat($im, $x, $y));
            if ($c['red'] > 200 && $c['green'] > 200 && $c['blue'] > 200) {
                $nonBg++;
            }
        }
    }
    echo "[$label] White-ish pixels (step 5): $nonBg\n";
}

describe_slice('scratch/bg_panitia_top.png', 'bg-panitia TOP');
describe_slice('scratch/bg_panitia_mid.png', 'bg-panitia MID');
describe_slice('scratch/bg_panitia_bot.png', 'bg-panitia BOT');
