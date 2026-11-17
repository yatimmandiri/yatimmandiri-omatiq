<?php

$src = imagecreatefrompng('public/assets/images/bg-panitia.png');
$sw = imagesx($src); // 1086
$sh = imagesy($src); // 1448

$targetW = 1224;
$targetH = 1932;

// To fit 1086x1448 into 1224x1932 while preserving aspect ratio:
// Option A: Crop sides (scale by height: scale = 1932 / 1448 = 1.334) -> width becomes 1086 * 1.334 = 1448px -> crop 112px from left and right.
$scale = $targetH / $sh;
$scaledW = (int) ($sw * $scale);
$cropX = (int) (($scaledW - $targetW) / 2 / $scale);
$srcW = (int) ($targetW / $scale);

$bgA = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($bgA, $src, 0, 0, $cropX, 0, $targetW, $targetH, $srcW, $sh);
imagepng($bgA, 'scratch/test_bg_fitted_crop.png');

// Option B: Direct resample
$bgB = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($bgB, $src, 0, 0, 0, 0, $targetW, $targetH, $sw, $sh);
imagepng($bgB, 'scratch/test_bg_fitted_direct.png');

echo "Saved test_bg_fitted_crop.png and test_bg_fitted_direct.png\n";
