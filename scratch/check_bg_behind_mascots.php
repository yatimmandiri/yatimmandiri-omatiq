<?php

$rawB = imagecreatefrompng('C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/media_1794281798570_9e7d3f1e.png');
// Check the middle column x=204 above and below the QR box
// and check clean background pixels at various heights
echo "Left edge (x=1) at various y:\n";
for ($y = 200; $y < 550; $y += 20) {
    $c = imagecolorat($rawB, 1, $y);
    printf("y=%d: #%06x\n", $y, $c & 0xFFFFFF);
}
echo "Right edge (x=406) at various y:\n";
for ($y = 200; $y < 550; $y += 20) {
    $c = imagecolorat($rawB, 406, $y);
    printf("y=%d: #%06x\n", $y, $c & 0xFFFFFF);
}
