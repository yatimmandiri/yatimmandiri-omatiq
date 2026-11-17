<?php

$omatiqImg = imagecreatefrompng('C:/laragon/www/github/yatimmandiri-omatiq/public/assets/images/Tulisan Omatiq Putih.png');
$w = imagesx($omatiqImg);
$h = imagesy($omatiqImg);

// Let's sample down vertical center
$lines = [];
for ($y = 0; $y < $h; $y += 10) {
    $hasWhite = false;
    for ($x = 0; $x < $w; $x += 10) {
        $rgb = imagecolorat($omatiqImg, $x, $y);
        $alpha = ($rgb >> 24) & 0x7F;
        if ($alpha < 50) {
            $hasWhite = true;
            break;
        }
    }
    if ($hasWhite) {
        $lines[] = $y;
    }
}
echo 'Lines with white in Tulisan Omatiq Putih: min='.min($lines).', max='.max($lines)."\n";
// Let's create a thumbnail of Tulisan Omatiq Putih to inspect
$thumb = imagecreatetruecolor(400, (int) (400 * $h / $w));
imagealphablending($thumb, false);
imagesavealpha($thumb, true);
imagecopyresampled($thumb, $omatiqImg, 0, 0, 0, 0, 400, (int) (400 * $h / $w), $w, $h);
imagepng($thumb, __DIR__.'/thumb_tulisan_omatiq.png');
echo 'Saved thumbnail: 400 x '.(int) (400 * $h / $w)."\n";
