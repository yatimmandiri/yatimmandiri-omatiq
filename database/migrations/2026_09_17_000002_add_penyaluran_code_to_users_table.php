<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users') && ! Schema::hasColumn('users', 'penyaluran_code')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('penyaluran_code', 30)->nullable()->index()->after('penyaluran_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'penyaluran_code')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('penyaluran_code');
            });
        }
    }
};
