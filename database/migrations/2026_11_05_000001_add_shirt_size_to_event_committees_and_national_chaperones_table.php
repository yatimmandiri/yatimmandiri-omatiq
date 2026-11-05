<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('event_committees') && ! Schema::hasColumn('event_committees', 'shirt_size')) {
            Schema::table('event_committees', function (Blueprint $table) {
                $table->string('shirt_size', 20)->nullable()->after('photo_path');
            });
        }

        if (Schema::hasTable('national_chaperones') && ! Schema::hasColumn('national_chaperones', 'shirt_size')) {
            Schema::table('national_chaperones', function (Blueprint $table) {
                $table->string('shirt_size', 20)->nullable()->after('gender');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('event_committees') && Schema::hasColumn('event_committees', 'shirt_size')) {
            Schema::table('event_committees', function (Blueprint $table) {
                $table->dropColumn('shirt_size');
            });
        }

        if (Schema::hasTable('national_chaperones') && Schema::hasColumn('national_chaperones', 'shirt_size')) {
            Schema::table('national_chaperones', function (Blueprint $table) {
                $table->dropColumn('shirt_size');
            });
        }
    }
};
