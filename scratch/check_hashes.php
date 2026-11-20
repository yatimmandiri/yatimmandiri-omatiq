<?php

// Are 6193fbbe and 3ae89431 identical?
$h1 = md5_file('public/assets/images/cards/test_raw_6193fbbe.png');
$h2 = md5_file('public/assets/images/cards/test_raw_3ae89431.png');
echo 'Front hash match: '.($h1 === $h2 ? "YES ($h1)" : "NO: $h1 vs $h2")."\n";

$h3 = md5_file('public/assets/images/cards/test_raw_213d1826.png');
$h4 = md5_file('public/assets/images/cards/test_raw_1b8f3562.png');
echo 'Back hash match: '.($h3 === $h4 ? "YES ($h3)" : "NO: $h3 vs $h4")."\n";
