<?php

$dir = 'C:/Users/Yatim Mandiri/.gemini/antigravity/brain/89ddf391-af56-4772-bc86-0c9fa99fd812/.user_uploaded/';
$files = [
    'panitia_1' => 'media_1794464026354_6193fbbe.png',
    'panitia_2' => 'media_1794464026354_213d1826.png',
    'pendamping_1' => 'media_1794452501114_7860d125.png',
    'pendamping_2' => 'media_1794452501114_f6cbe61c.png',
    'peserta_1' => 'media_1794196732250_86309bdb.png',
    'peserta_2' => 'media_1794196732329_ef0bee6a.png',
];

foreach ($files as $name => $f) {
    copy($dir.$f, 'scratch/'.$name.'.png');
}
echo "Copied files to scratch/\n";
