<?php

$frontPath = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882598_28c9da3c.png';
$backPath = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794895882578_e8913560.png';

$infoFront = getimagesize($frontPath);
$infoBack = getimagesize($backPath);

echo 'Front: '.$infoFront[0].'x'.$infoFront[1]."\n";
echo 'Back: '.$infoBack[0].'x'.$infoBack[1]."\n";
