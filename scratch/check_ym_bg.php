<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');

for ($y = 115; $y <= 235; $y += 20) {
    $cTop = imagecolorat($imF, 650, $y);
    $cLeft = imagecolorat($imF, 588, $y);
    $cRight = imagecolorat($imF, 755, $y);
    printf("y=%d: left(x=588)=#%06x, right(x=755)=#%06x\n", $y, $cLeft & 0xFFFFFF, $cRight & 0xFFFFFF);
}
