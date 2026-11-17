<?php

$src = imagecreatefrompng('public/assets/images/bg-panitia.png');
$sw = imagesx($src);
$sh = imagesy($src);

$targetW = 1224;
$targetH = 1932;

$dst = imagecreatetruecolor($targetW, $targetH);
// Scale and fit properly
imagecopyresampled($dst, $src, 0, 0, 0, 0, $targetW, $targetH, $sw, $sh);

// Ensure top and bottom 10 rows have NO black line artifact (clamp with row 10 if needed)
for ($y = 0; $y < 5; $y++) {
    for ($x = 0; $x < $targetW; $x++) {
        $c = imagecolorat($dst, $x, 6);
        imagesetpixel($dst, $x, $y, $c);
    }
}
for ($y = $targetH - 5; $y < $targetH; $y++) {
    for ($x = 0; $x < $targetW; $x++) {
        $c = imagecolorat($dst, $x, $targetH - 7);
        imagesetpixel($dst, $x, $y, $c);
    }
}

imagepng($dst, 'public/assets/images/cards/card-committee-bg-front.png');
imagepng($dst, 'public/assets/images/cards/card-committee-bg-back.png');

echo "Saved card-committee-bg-front.png and card-committee-bg-back.png from bg-panitia.png\n";
