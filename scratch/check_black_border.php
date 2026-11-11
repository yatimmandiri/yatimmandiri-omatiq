<?php

$imF = imagecreatefrompng('public/assets/images/cards/card-bg-front.png');
$imB = imagecreatefrompng('public/assets/images/cards/card-bg-back.png');

echo "Front Card Center X=612:\n";
for ($y = 0; $y < 8; $y++) {
    printf("  Top y=%d: #%06x\n", $y, imagecolorat($imF, 612, $y) & 0xFFFFFF);
}
for ($y = 1936; $y < 1944; $y++) {
    printf("  Bottom y=%d: #%06x\n", $y, imagecolorat($imF, 612, $y) & 0xFFFFFF);
}

echo "Back Card Center X=612:\n";
for ($y = 0; $y < 8; $y++) {
    printf("  Top y=%d: #%06x\n", $y, imagecolorat($imB, 612, $y) & 0xFFFFFF);
}
for ($y = 1936; $y < 1944; $y++) {
    printf("  Bottom y=%d: #%06x\n", $y, imagecolorat($imB, 612, $y) & 0xFFFFFF);
}
