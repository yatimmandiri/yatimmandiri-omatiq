<?php

// Compare features of raw_1b8f3562.png and raw_3ae89431.png
$im1 = imagecreatefrompng('scratch/raw_1b8f3562.png'); // 408 x 648
$im2 = imagecreatefrompng('scratch/raw_3ae89431.png'); // 408 x 648

// Check where is the word "Panitia" banner at top
// Banner in media_1794882932784_062fabf3.jpg is at y = 10..50
// Let's sample colors across y = 10..80, x = 204 (center)
echo "--- raw_1b8f3562 (supposedly 1b8f3562) ---\n";
for ($y = 10; $y <= 60; $y += 10) {
    $c = imagecolorsforindex($im1, imagecolorat($im1, 204, $y));
    echo "y=$y: ({$c['red']},{$c['green']},{$c['blue']})\n";
}

echo "--- raw_3ae89431 (supposedly 3ae89431) ---\n";
for ($y = 10; $y <= 60; $y += 10) {
    $c = imagecolorsforindex($im2, imagecolorat($im2, 204, $y));
    echo "y=$y: ({$c['red']},{$c['green']},{$c['blue']})\n";
}
