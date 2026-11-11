<?php

$im = imagecreatefrompng('scratch/crop_ym_clean.png');
$w = imagesx($im);
$h = imagesy($im);
echo "Clean YM logo size: {$w}x{$h}\n";

// Let's sample colors in the top half and bottom half
$topColors = [];
for ($y = 0; $y < (int) ($h * 0.6); $y += 20) {
    for ($x = 0; $x < $w; $x += 20) {
        $c = imagecolorat($im, $x, $y);
        $a = ($c >> 24) & 0x7F;
        if ($a < 50) {
            $hex = sprintf('#%06x', $c & 0xFFFFFF);
            $topColors[$hex] = ($topColors[$hex] ?? 0) + 1;
        }
    }
}
arsort($topColors);
echo "Top colors:\n";
foreach (array_slice($topColors, 0, 5) as $col => $cnt) {
    echo "  $col: $cnt\n";
}

$botColors = [];
for ($y = (int) ($h * 0.6); $y < $h; $y += 10) {
    for ($x = 0; $x < $w; $x += 10) {
        $c = imagecolorat($im, $x, $y);
        $a = ($c >> 24) & 0x7F;
        if ($a < 50) {
            $hex = sprintf('#%06x', $c & 0xFFFFFF);
            $botColors[$hex] = ($botColors[$hex] ?? 0) + 1;
        }
    }
}
arsort($botColors);
echo "Bottom colors:\n";
foreach (array_slice($botColors, 0, 5) as $col => $cnt) {
    echo "  $col: $cnt\n";
}
