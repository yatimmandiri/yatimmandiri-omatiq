<?php

$f = 'public/assets/images/Omatiq 2026 - Background Cerah.png';
$info = getimagesize($f);
echo "$f => {$info[0]}x{$info[1]}\n";
