<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('students') && ! Schema::hasColumn('students', 'is_active')) {
            Schema::table('students', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->index()->after('is_binaan');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('students') && Schema::hasColumn('students', 'is_active')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};
