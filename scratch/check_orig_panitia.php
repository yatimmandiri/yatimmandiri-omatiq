<?php

$frontSrc = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794464026354_6193fbbe.png';
$backSrc = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794464026354_213d1826.png';

$imF = imagecreatefrompng($frontSrc);
$imB = imagecreatefrompng($backSrc);

// Save full-sized preview in scratch to examine
imagepng($imF, 'scratch/orig_panitia_front.png');
imagepng($imB, 'scratch/orig_panitia_back.png');

echo "Saved scratch/orig_panitia_front.png and scratch/orig_panitia_back.png\n";
