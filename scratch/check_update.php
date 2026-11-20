<?php

$bladeFile = 'C:/laragon/www/github/yatimmandiri-omatiq/resources/views/cards/committee-card.blade.php';

// Let's create an updated preview test script
$html = file_get_contents($bladeFile);

echo 'Loaded blade: '.strlen($html)." bytes\n";
