<?php

$imFront = imagecreatefrompng('public/assets/images/cards/test_raw_3ae89431.png');
$imBack = imagecreatefrompng('public/assets/images/cards/test_raw_1b8f3562.png');

echo "=== FRONT (3ae89431 / 6193fbbe) 408x648 ===\n";
for ($y = 15; $y <= 45; $y += 10) {
    $cBack = imagecolorsforindex($imBack, imagecolorat($imBack, 204, $y));
    $cFront = imagecolorsforindex($imFront, imagecolorat($imFront, 204, $y));
    echo "y=$y: Front=({$cFront['red']},{$cFront['green']},{$cFront['blue']}) Back=({$cBack['red']},{$cBack['green']},{$cBack['blue']})\n";
}
