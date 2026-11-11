<?php

$imBack = imagecreatefrompng('scratch/test_bg_back.png');
for ($y = 705; $y <= 1320; $y++) {
    for ($x = 270; $x <= 950; $x++) {
        $c = imagecolorat($imBack, $x, $y);
        if (($c & 0xFFFFFF) !== 0xFFFFFF) {
            printf("Non-white at x=%d, y=%d: #%06x\n", $x, $y, $c & 0xFFFFFF);
        }
    }
}
