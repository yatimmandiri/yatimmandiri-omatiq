<?php

$imL = imagecreatefrompng('scratch/header_pendamping_left.png');
$w = imagesx($imL);
$h = imagesy($imL);

// Check colors in left
$colors = [];
for ($y = 0; $y < $h; $y += 2) {
    for ($x = 0; $x < $w; $x += 2) {
        $c = imagecolorat($imL, $x, $y) & 0xFFFFFF;
        // ignore background krem ~ #FDFCEB
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if (! ($r > 240 && $g > 235 && $b > 220)) {
            $colors[$c] = ($colors[$c] ?? 0) + 1;
        }
    }
}
arsort($colors);
echo "Top colors in header_pendamping_left:\n";
foreach (array_slice($colors, 0, 8, true) as $c => $cnt) {
    printf("  #%06X: %d\n", $c, $cnt);
}
