<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'provider',
    'provider_id',
    'provider_token',
    'provider_refresh_token',
])]

class Social extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
