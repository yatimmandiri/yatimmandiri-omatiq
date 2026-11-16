<?php

$im = imagecreatefrompng('scratch/pendamping_front_mid.png');
$w = imagesx($im);
$h = imagesy($im);

$bw = imagecreatetruecolor($w, $h);
$white = imagecolorallocate($bw, 255, 255, 255);
$black = imagecolorallocate($bw, 0, 0, 0);
imagefilledrectangle($bw, 0, 0, $w, $h, $white);

for ($y = 0; $y < $h; $y++) {
    for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($im, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // Text is brown/gold or dark
        if ($r < 180 && $g < 160 && $b < 100) {
            imagesetpixel($bw, $x, $y, $black);
        }
    }
}
imagepng($bw, 'scratch/pendamping_front_text_detected.png');
echo "Saved scratch/pendamping_front_text_detected.png\n";

// Let's also print simple ASCII art of the text rows
for ($y = 0; $y < $h; $y += 4) {
    $row = '';
    $hasDark = false;
    for ($x = 0; $x < $w; $x += 4) {
        $c = imagecolorat($im, $x, $y);
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        if ($r < 180 && $g < 160 && $b < 100) {
            $row .= '#';
            $hasDark = true;
        } else {
            $row .= ' ';
        }
    }
    if ($hasDark) {
        echo sprintf("%3d: %s\n", $y + 250, rtrim($row));
    }
}
