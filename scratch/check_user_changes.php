<?php

// Check what changed between HEAD and working copy
exec('git diff -U1 resources/views/cards/committee-card.blade.php', $output);
$diff = implode("\n", $output);

// Find hunks where lines were modified
echo 'Diff size: '.strlen($diff)." bytes\n";
// Let's filter to see specific user modifications
$lines = explode("\n", $diff);
foreach ($lines as $i => $line) {
    if (str_starts_with($line, '@@')) {
        echo "\n".$line."\n";
        for ($j = 1; $j <= 15 && isset($lines[$i + $j]); $j++) {
            if (str_starts_with($lines[$i + $j], '@@')) {
                break;
            }
            echo $lines[$i + $j]."\n";
        }
    }
}
