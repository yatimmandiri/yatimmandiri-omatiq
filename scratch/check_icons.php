<?php

$omatiq = imagecreatefrompng('public/assets/images/icon-omatiq.png');
$ym = imagecreatefrompng('public/assets/images/icon-ym.png');

echo 'icon-omatiq: '.imagesx($omatiq).'x'.imagesy($omatiq)."\n";
echo 'icon-ym: '.imagesx($ym).'x'.imagesy($ym)."\n";
