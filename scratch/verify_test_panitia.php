<?php

$f = imagecreatefrompng('scratch/test_panitia_front.png');
$b = imagecreatefrompng('scratch/test_panitia_back.png');

echo "=== Front Header (y=160) ===\n";
for ($x = 300; $x <= 900; $x += 100) {
    $c = imagecolorsforindex($f, imagecolorat($f, $x, 160));
    echo "x=$x: RGB({$c['red']},{$c['green']},{$c['blue']})\n";
}

echo "=== Front Data Box (x=612) ===\n";
for ($y = 1050; $y <= 1300; $y += 50) {
    $c = imagecolorsforindex($f, imagecolorat($f, 612, $y));
    echo "y=$y: RGB({$c['red']},{$c['green']},{$c['blue']})\n";
}

echo "=== Back Center (x=612, y=800..1300) ===\n";
for ($y = 800; $y <= 1300; $y += 100) {
    $c = imagecolorsforindex($b, imagecolorat($b, 612, $y));
    echo "y=$y: RGB({$c['red']},{$c['green']},{$c['blue']})\n";
}

echo "=== Back Left (Zakki x=200, y=1100) ===\n";
$cZ = imagecolorsforindex($b, imagecolorat($b, 200, 1100));
echo "Zakki x=200, y=1100: RGB({$cZ['red']},{$cZ['green']},{$cZ['blue']})\n";

echo "=== Back Right (Amila x=1050, y=1100) ===\n";
$cA = imagecolorsforindex($b, imagecolorat($b, 1050, 1100));
echo "Amila x=1050, y=1100: RGB({$cA['red']},{$cA['green']},{$cA['blue']})\n";
