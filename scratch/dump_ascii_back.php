<?php

$b = 'scratch/raw_1b8f3562.png';
$imB = imagecreatefrompng($b);

echo "=== 1b8f3562 map (40 cols, 65 rows) ===\n";
for ($y = 0; $y < 648; $y += 10) {
    $line = sprintf('%3d ', $y);
    for ($x = 0; $x < 408; $x += 10) {
        $c = imagecolorsforindex($imB, imagecolorat($imB, $x, $y));
        if ($c['red'] > 240 && $c['green'] > 240 && $c['blue'] > 240) {
            $line .= '#'; // white
        } elseif ($c['red'] < 60 && $c['green'] < 60 && $c['blue'] > 100) {
            $line .= 'Y';
        } elseif ($c['red'] < 30 && $c['green'] > 80 && $c['blue'] > 80) {
            $line .= 'T';
        } else {
            $line .= '.';
        }
    }
    echo $line."\n";
}
