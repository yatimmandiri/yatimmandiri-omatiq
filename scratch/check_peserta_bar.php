<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');
$w = imagesx($imF);

// Let's inspect the puzzle icon (left) and YM logo (right)
// In the header, there is PESERTA bar at y=~340?
// Let's find where PESERTA bar starts
// Let's check color along vertical line at x=300
for ($y = 100; $y < 450; $y += 10) {
    $c = imagecolorat($imF, 300, $y);
    printf("y=%d: #%06x\n", $y, $c & 0xFFFFFF);
}
