<?php

$crop = imagecreatefrompng('scratch/crop_peeking_front.png');
$w = imagesx($crop);
$h = imagesy($crop);
echo "crop_peeking_front: $w x $h\n";
// Let's check colors around y = 200..230 (which corresponds to y=1000..1030 in front card)
for ($y = 190; $y < 235; $y += 5) {
    for ($x = 100; $x < 350; $x += 50) {
        $c = imagecolorat($crop, $x, $y);
        printf("y=%d,x=%d: #%06x\n", $y, $x, $c & 0xFFFFFF);
    }
}
