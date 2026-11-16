<?php

$im = imagecreatefrompng('scratch/crop_chaperone_front_box.png');
$w = imagesx($im);
$h = imagesy($im);

// Let's check pixel colors around the center (x: 400..800, y: 100..350)
$colors = [];
for ($y = 50; $y < $h - 50; $y += 5) {
    for ($x = 300; $x < $w - 300; $x += 5) {
        $c = imagecolorat($im, $x, $y) & 0xFFFFFF;
        $colors[$c] = ($colors[$c] ?? 0) + 1;
    }
}
arsort($colors);
$topColors = array_slice($colors, 0, 10, true);
foreach ($topColors as $col => $cnt) {
    printf("#%06X: %d\n", $col, $cnt);
}
