<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');
$w = imagesx($imF);

// Check pixels for y from 100 to 290
// Find bounds of logos between x=300 and x=900
$pixels = [];
for ($y = 110; $y <= 290; $y++) {
    for ($x = 300; $x <= 950; $x++) {
        $c = imagecolorat($imF, $x, $y) & 0xFFFFFF;
        $r = ($c >> 16) & 0xFF;
        $g = ($c >> 8) & 0xFF;
        $b = $c & 0xFF;
        // Background is light teal #f6fffe - #fcffff
        if (! ($r >= 240 && $g >= 250 && $b >= 250)) {
            $pixels[] = ['x' => $x, 'y' => $y, 'col' => sprintf('#%06x', $c)];
        }
    }
}

echo 'Found '.count($pixels)." non-bg pixels between y=110..290, x=300..950\n";

// Let's find min/max X and Y
$minX = 9999;
$maxX = 0;
$minY = 9999;
$maxY = 0;
foreach ($pixels as $p) {
    if ($p['x'] < $minX) {
        $minX = $p['x'];
    }
    if ($p['x'] > $maxX) {
        $maxX = $p['x'];
    }
    if ($p['y'] < $minY) {
        $minY = $p['y'];
    }
    if ($p['y'] > $maxY) {
        $maxY = $p['y'];
    }
}
echo "Combined bounds: x=$minX..$maxX, y=$minY..$maxY (W=".($maxX - $minX + 1).', H='.($maxY - $minY + 1).")\n";

// Look for gap between left logo and right logo along X
$cols = [];
for ($x = $minX; $x <= $maxX; $x++) {
    $count = 0;
    foreach ($pixels as $p) {
        if ($p['x'] === $x) {
            $count++;
        }
    }
    $cols[$x] = $count;
}

// Print histogram of columns
echo "Column counts:\n";
$inGap = false;
$gapStart = 0;
for ($x = $minX; $x <= $maxX; $x++) {
    if ($cols[$x] === 0 && ! $inGap) {
        $inGap = true;
        $gapStart = $x;
    } elseif ($cols[$x] > 0 && $inGap) {
        $inGap = false;
        echo "  Gap from x=$gapStart to x=".($x - 1).' (width '.($x - $gapStart)."px)\n";
    }
}
