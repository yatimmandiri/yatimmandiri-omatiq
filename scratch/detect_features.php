<?php

// Let's analyze where "Panitia" bar is, where "Alfia Rahma" is, where QR code is
function detect_features($file, $tag)
{
    $im = imagecreatefrompng($file);
    $w = imagesx($im);
    $h = imagesy($im);

    // Check for "Panitia" top banner.
    // In the user's screenshot media_1794882932784_062fabf3.jpg, there is a prominent rounded/curved dark teal bar at top with the word "Panitia".
    // Let's see what y ranges have that banner.
    for ($y = 10; $y < 70; $y += 10) {
        $c = imagecolorsforindex($im, imagecolorat($im, intval($w / 2), $y));
        echo "[$tag] y=$y: RGB({$c['red']},{$c['green']},{$c['blue']})\n";
    }
}

detect_features('scratch/panitia_1.png', 'panitia_1');
echo "---\n";
detect_features('scratch/panitia_2.png', 'panitia_2');
