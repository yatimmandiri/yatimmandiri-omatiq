<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('olimpiades', function (Blueprint $table) {
            $table->boolean('is_open_public')->default(true)->index()->after('status');
            $table->boolean('is_open_binaan')->default(true)->index()->after('is_open_public');
        });
    }

    public function down(): void
    {
        Schema::table('olimpiades', function (Blueprint $table) {
            $table->dropIndex(['is_open_public']);
            $table->dropIndex(['is_open_binaan']);
            $table->dropColumn(['is_open_public', 'is_open_binaan']);
        });
    }
};
