<?php

$imF = imagecreatefrompng('scratch/test_bg_front.png');
for ($y = 1018; $y <= 1028; $y++) {
    for ($x = 720; $x <= 1080; $x += 20) {
        $c = imagecolorat($imF, $x, $y);
        printf("y=%d, x=%d: #%06x\n", $y, $x, $c & 0xFFFFFF);
    }
}
