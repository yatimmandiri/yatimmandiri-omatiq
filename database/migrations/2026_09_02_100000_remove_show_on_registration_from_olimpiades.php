<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('olimpiades') && Schema::hasColumn('olimpiades', 'show_on_registration')) {
            Schema::table('olimpiades', function (Blueprint $table) {
                $table->dropColumn('show_on_registration');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('olimpiades') && ! Schema::hasColumn('olimpiades', 'show_on_registration')) {
            Schema::table('olimpiades', function (Blueprint $table) {
                $table->boolean('show_on_registration')->default(true)->index();
            });
        }
    }
};
