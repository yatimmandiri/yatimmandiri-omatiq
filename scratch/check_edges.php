<?php

$f = imagecreatefrompng('public/assets/images/cards/card-committee-bg-front.png');
$b = imagecreatefrompng('public/assets/images/cards/card-committee-bg-back.png');

$w = imagesx($f);
$h = imagesy($f);

echo "=== Front top 5 rows (x=612) ===\n";
for ($y = 0; $y < 5; $y++) {
    $c = imagecolorsforindex($f, imagecolorat($f, 612, $y));
    echo "y=$y: RGB({$c['red']},{$c['green']},{$c['blue']})\n";
}

echo "=== Front bottom 5 rows (x=612) ===\n";
for ($y = $h - 5; $y < $h; $y++) {
    $c = imagecolorsforindex($f, imagecolorat($f, 612, $y));
    echo "y=$y: RGB({$c['red']},{$c['green']},{$c['blue']})\n";
}

echo "=== Back top 5 rows (x=612) ===\n";
for ($y = 0; $y < 5; $y++) {
    $c = imagecolorsforindex($b, imagecolorat($b, 612, $y));
    echo "y=$y: RGB({$c['red']},{$c['green']},{$c['blue']})\n";
}

echo "=== Back bottom 5 rows (x=612) ===\n";
for ($y = $h - 5; $y < $h; $y++) {
    $c = imagecolorsforindex($b, imagecolorat($b, 612, $y));
    echo "y=$y: RGB({$c['red']},{$c['green']},{$c['blue']})\n";
}
