<?php

$imR = imagecreatefrompng('scratch/header_pendamping_right.png');
$w = imagesx($imR);
$h = imagesy($imR);

$colors = [];
for ($y = 0; $y < $h; $y += 2) {
    for ($x = 0; $x < $w; $x += 2) {
        $c = imagecolorat($imR, $x, $y) & 0xFFFFFF;
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if (! ($r > 240 && $g > 235 && $b > 220)) {
            $colors[$c] = ($colors[$c] ?? 0) + 1;
        }
    }
}
arsort($colors);
echo "Top colors in header_pendamping_right:\n";
foreach (array_slice($colors, 0, 8, true) as $c => $cnt) {
    printf("  #%06X: %d\n", $c, $cnt);
}
