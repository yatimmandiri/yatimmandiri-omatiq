<?php

$sz = getimagesize('public/assets/images/bg-panitia.png');
echo "bg-panitia.png: {$sz[0]}x{$sz[1]} ({$sz['mime']})\n";
$szPend = getimagesize('public/assets/images/bg-pendamping.png');
echo "bg-pendamping.png: {$szPend[0]}x{$szPend[1]} ({$szPend['mime']})\n";
$szPes = getimagesize('public/assets/images/bg-peserta.png');
echo "bg-peserta.png: {$szPes[0]}x{$szPes[1]} ({$szPes['mime']})\n";
