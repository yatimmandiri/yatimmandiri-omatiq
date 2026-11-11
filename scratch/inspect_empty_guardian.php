<?php

use App\Models\Company\Participant;
use Illuminate\Contracts\Console\Kernel;

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$p = Participant::with(['student', 'mentor'])->whereNull('guardian_signature_name')->orWhere('guardian_signature_name', '')->first();

if ($p) {
    echo 'Participant ID: '.$p->id."\n";
    echo 'Reg Number: '.$p->registration_number."\n";
    echo 'Type: '.$p->registration_type."\n";
    echo 'Participant sig: '.$p->participant_signature_name."\n";
    echo "Guardian sig: '".$p->guardian_signature_name."'\n";
    echo 'Branch: '.$p->branch."\n";
    echo 'Student Name: '.$p->student?->full_name."\n";
    echo 'Student Parent Phone: '.$p->student?->parent_phone."\n";
    echo 'Student Mentor Name: '.$p->student?->mentor_name."\n";
    echo 'Student Mentor Phone: '.$p->student?->mentor_phone."\n";
}

$nonEmpty = Participant::whereNotNull('guardian_signature_name')->where('guardian_signature_name', '!=', '')->count();
echo "Non-empty guardian_signature_name: $nonEmpty\n";

$sampleFilled = Participant::whereNotNull('guardian_signature_name')->where('guardian_signature_name', '!=', '')->first();
if ($sampleFilled) {
    echo "Sample filled: ID={$sampleFilled->id}, Type={$sampleFilled->registration_type}, Guardian={$sampleFilled->guardian_signature_name}\n";
}
