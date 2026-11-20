<?php

$im = imagecreatefrompng('scratch/test_panitia_front.png');
// In test_panitia_front.png (1224 x 1932):
// top: 73% is 1932 * 0.73 = 1410.36 px.
// Where are the Telkomsel / Chickin logos in test_panitia_front.png?
// Let's find rows around 1400..1650 that have colored sponsor pixels
for ($y = 1350; $y <= 1650; $y += 20) {
    $colored = 0;
    for ($x = 200; $x <= 1024; $x++) {
        $c = imagecolorsforindex($im, imagecolorat($im, $x, $y));
        // Check for non-teal / non-background pixels (e.g. red, yellow, dark blue)
        if ($c['red'] > 180 && $c['green'] < 80) {
            $colored++;
        } // red
        if ($c['red'] > 180 && $c['green'] > 180 && $c['blue'] < 50) {
            $colored++;
        } // yellow
    }
    if ($colored > 10) {
        echo sprintf("y=%4d (%.1f%% of 1932): colored sponsor px = %d\n", $y, ($y / 1932) * 100, $colored);
    }
}
