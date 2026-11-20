<?php

$uploadDir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
// Let's create an HTML report with the uploaded images so we can see all of them clearly
$files = [
    '6193fbbe' => 'media_1794464026354_6193fbbe.png',
    '213d1826' => 'media_1794464026354_213d1826.png',
    '3ae89431' => 'media_1794554817858_3ae89431.png',
    '1b8f3562' => 'media_1794554817791_1b8f3562.png',
    '7860d125' => 'media_1794452501114_7860d125.png',
    'f6cbe61c' => 'media_1794452501114_f6cbe61c.png',
    '86309bdb' => 'media_1794196732250_86309bdb.png',
    'ef0bee6a' => 'media_1794196732329_ef0bee6a.png',
];

foreach ($files as $tag => $f) {
    copy($uploadDir.$f, "public/assets/images/cards/test_raw_{$tag}.png");
}

echo "Copied test files to public/assets/images/cards/\n";
