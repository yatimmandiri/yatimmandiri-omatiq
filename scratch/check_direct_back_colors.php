<?php

$im = imagecreatefrompng('scratch/direct_chaperone_back_hd.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's sample colors in the center area (x: 400..800, y: 800..1200)
$colors = [];
for ($y = 800; $y < 1200; $y += 10) {
    for ($x = 400; $x < 800; $x += 10) {
        $c = imagecolorat($im, $x, $y) & 0xFFFFFF;
        $colors[$c] = ($colors[$c] ?? 0) + 1;
    }
}
arsort($colors);
echo "Top colors in center of direct_chaperone_back_hd:\n";
foreach (array_slice($colors, 0, 10, true) as $c => $cnt) {
    printf("  #%06X: %d\n", $c, $cnt);
}
