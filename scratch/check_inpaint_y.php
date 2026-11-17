<?php

$rawPB = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794554817867_01639dbf.png');
$targetW = 1224;
$targetH = 1932;
$im = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($im, $rawPB, 0, 0, 0, 0, $targetW, $targetH, imagesx($rawPB), imagesy($rawPB));

// What is at y=685?
echo "--- Checking y around 685 in Chaperone Back (1224x1932) ---\n";
for ($y = 600; $y <= 750; $y += 25) {
    $c = imagecolorsforindex($im, imagecolorat($im, 612, $y));
    echo sprintf("y=%4d: RGB(%3d,%3d,%3d)\n", $y, $c['red'], $c['green'], $c['blue']);
}
