<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Spatie\Permission\Models\Role as ModelsRole;

#[Fillable([
    'name',
    'guard_name',
])]

class Role extends ModelsRole
{
    public function scopeSearch($query, $search)
    {
        return $query->when($search, function ($q, $search) {
            $q->where('name', 'like', "%{$search}%");
        });
    }
}
