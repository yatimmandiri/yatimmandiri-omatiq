<?php

$f = 'scratch/raw_3ae89431.png';
$b = 'scratch/raw_1b8f3562.png';

$imF = imagecreatefrompng($f);
$imB = imagecreatefrompng($b);

// Let's inspect where pixels are white or dark or colored
// We can dump an ascii map of 3ae89431
echo "=== 3ae89431 map (40 cols, 65 rows) ===\n";
for ($y = 0; $y < 648; $y += 10) {
    $line = sprintf('%3d ', $y);
    for ($x = 0; $x < 408; $x += 10) {
        $c = imagecolorsforindex($imF, imagecolorat($imF, $x, $y));
        // if white
        if ($c['red'] > 240 && $c['green'] > 240 && $c['blue'] > 240) {
            $line .= '#'; // white text / icon
        } elseif ($c['red'] < 60 && $c['green'] < 60 && $c['blue'] > 100) {
            $line .= 'Y'; // YM navy
        } elseif ($c['red'] < 30 && $c['green'] > 80 && $c['blue'] > 80) {
            $line .= 'T'; // Teal
        } else {
            $line .= '.';
        }
    }
    echo $line."\n";
}
