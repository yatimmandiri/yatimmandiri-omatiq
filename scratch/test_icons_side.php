<?php

function cropAlpha($src)
{
    $w = imagesx($src);
    $h = imagesy($src);
    $minX = $w;
    $maxX = 0;
    $minY = $h;
    $maxY = 0;
    for ($y = 0; $y < $h; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $c = imagecolorat($src, $x, $y);
            $a = ($c >> 24) & 0x7F;
            if ($a < 120) {
                if ($x < $minX) {
                    $minX = $x;
                }
                if ($x > $maxX) {
                    $maxX = $x;
                }
                if ($y < $minY) {
                    $minY = $y;
                }
                if ($y > $maxY) {
                    $maxY = $y;
                }
            }
        }
    }
    $cw = $maxX - $minX + 1;
    $ch = $maxY - $minY + 1;
    $dst = imagecreatetruecolor($cw, $ch);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    $trans = imagecolorallocatealpha($dst, 0, 0, 0, 127);
    imagefilledrectangle($dst, 0, 0, $cw, $ch, $trans);
    imagecopy($dst, $src, 0, 0, $minX, $minY, $cw, $ch);

    return $dst;
}

$rawOmatiq = imagecreatefrompng('public/assets/images/icon-omatiq.png');
$cropOmatiq = cropAlpha($rawOmatiq);
echo 'Cropped icon-omatiq: '.imagesx($cropOmatiq).'x'.imagesy($cropOmatiq)."\n";

$rawYM = imagecreatefrompng('public/assets/images/icon-ym.png');
$cropYM = cropAlpha($rawYM);
echo 'Cropped icon-ym: '.imagesx($cropYM).'x'.imagesy($cropYM)."\n";

// Test placing them side by side
$targetH = 115;
$scaleOmatiq = $targetH / imagesy($cropOmatiq);
$wOmatiq = (int) (imagesx($cropOmatiq) * $scaleOmatiq);

$scaleYM = $targetH / imagesy($cropYM);
$wYM = (int) (imagesx($cropYM) * $scaleYM);

$gap = 24;
$totalW = $wOmatiq + $gap + $wYM;
echo "Combined width at height $targetH: $wOmatiq + $gap + $wYM = $totalW (Center X: ".((1224 - $totalW) / 2).")\n";

$testCanvas = imagecreatetruecolor(1224, 300);
$bgCol = imagecolorallocate($testCanvas, 254, 251, 233);
imagefilledrectangle($testCanvas, 0, 0, 1224, 300, $bgCol);
imagealphablending($testCanvas, true);

$startX = (int) ((1224 - $totalW) / 2);
imagecopyresampled($testCanvas, $cropOmatiq, $startX, 100, 0, 0, $wOmatiq, $targetH, imagesx($cropOmatiq), imagesy($cropOmatiq));
imagecopyresampled($testCanvas, $cropYM, $startX + $wOmatiq + $gap, 100, 0, 0, $wYM, $targetH, imagesx($cropYM), imagesy($cropYM));

imagepng($testCanvas, 'scratch/test_side_by_side_icons.png');
echo "Saved scratch/test_side_by_side_icons.png\n";
