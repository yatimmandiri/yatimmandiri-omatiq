<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Spatie\Permission\Models\Permission as ModelsPermission;

#[Fillable([
    'name',
    'guard_name',
])]

class Permission extends ModelsPermission
{
    public function scopeSearch($query, $search)
    {
        return $query->when($search, function ($q, $search) {
            $q->where('name', 'like', "%{$search}%");
        });
    }
}
