<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');
// Let's inspect column x=800 and x=950 for y from 980 to 1050
for ($y = 980; $y <= 1040; $y++) {
    $c1 = imagecolorat($imF, 800, $y);
    $c2 = imagecolorat($imF, 950, $y);
    printf("front y=%d: x=800:#%06x, x=950:#%06x\n", $y, $c1 & 0xFFFFFF, $c2 & 0xFFFFFF);
}
