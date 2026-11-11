<?php

$im3 = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794346596213_566a698f.png');
$out = imagecreatetruecolor(imagesx($im3), imagesy($im3));
imagecopy($out, $im3, 0, 0, 0, 0, imagesx($im3), imagesy($im3));

// Interpolate vertically across the text region
$yStart = 26;
$yEnd = 39;
$xStart = 195;
$xEnd = 330;

for ($x = $xStart; $x <= $xEnd; $x++) {
    $cTop = imagecolorat($out, $x, $yStart);
    $cBot = imagecolorat($out, $x, $yEnd);

    $rT = ($cTop >> 16) & 0xFF;
    $gT = ($cTop >> 8) & 0xFF;
    $bT = $cTop & 0xFF;
    $rB = ($cBot >> 16) & 0xFF;
    $gB = ($cBot >> 8) & 0xFF;
    $bB = $cBot & 0xFF;

    for ($y = $yStart + 1; $y < $yEnd; $y++) {
        $t = ($y - $yStart) / ($yEnd - $yStart);
        $r = (int) ($rT + $t * ($rB - $rT));
        $g = (int) ($gT + $t * ($gB - $gT));
        $b = (int) ($bT + $t * ($bB - $bT));

        imagesetpixel($out, $x, $y, imagecolorallocate($out, $r, $g, $b));
    }
}

imagepng($out, 'scratch/test_inpainted_image3.png');
echo "Saved test_inpainted_image3.png\n";
