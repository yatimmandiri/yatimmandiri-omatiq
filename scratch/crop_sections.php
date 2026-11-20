<?php

$front = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png');
$back = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882578_e8913560.png');

$w = imagesx($front);
$h = imagesy($front);

// Let's crop:
// 1. Top of front (y: 0 to 180)
$cropTop = imagecreatetruecolor($w, 180);
imagecopy($cropTop, $front, 0, 0, 0, 0, $w, 180);
imagepng($cropTop, __DIR__.'/crop_front_top.png');

// 2. Title block of front (y: 160 to 280)
$cropTitle = imagecreatetruecolor($w, 120);
imagecopy($cropTitle, $front, 0, 0, 0, 160, $w, 120);
imagepng($cropTitle, __DIR__.'/crop_front_title.png');

// 3. Mascots and top of box (y: 260 to 380)
$cropMascots = imagecreatetruecolor($w, 120);
imagecopy($cropMascots, $front, 0, 0, 0, 260, $w, 120);
imagepng($cropMascots, __DIR__.'/crop_front_mascots.png');

// 4. Box body & name (y: 340 to 480)
$cropBox = imagecreatetruecolor($w, 140);
imagecopy($cropBox, $front, 0, 0, 0, 340, $w, 140);
imagepng($cropBox, __DIR__.'/crop_front_box.png');

// 5. Sponsors & bottom (y: 460 to 648)
$cropSponsors = imagecreatetruecolor($w, 188);
imagecopy($cropSponsors, $front, 0, 0, 0, 460, $w, 188);
imagepng($cropSponsors, __DIR__.'/crop_front_sponsors.png');

// 6. Back top (y: 0 to 250)
$cropBackTop = imagecreatetruecolor($w, 250);
imagecopy($cropBackTop, $back, 0, 0, 0, 0, $w, 250);
imagepng($cropBackTop, __DIR__.'/crop_back_top.png');

// 7. Back QR & mascots (y: 220 to 500)
$cropBackMid = imagecreatetruecolor($w, 280);
imagecopy($cropBackMid, $back, 0, 0, 0, 220, $w, 280);
imagepng($cropBackMid, __DIR__.'/crop_back_mid.png');

echo "Saved all crops!\n";
