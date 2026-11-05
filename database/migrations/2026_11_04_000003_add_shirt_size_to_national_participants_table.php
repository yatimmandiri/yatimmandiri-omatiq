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
        if (Schema::hasTable('national_participants')) {
            Schema::table('national_participants', function (Blueprint $table) {
                if (! Schema::hasColumn('national_participants', 'shirt_size')) {
                    $table->string('shirt_size', 20)->nullable()->after('status');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('national_participants')) {
            Schema::table('national_participants', function (Blueprint $table) {
                if (Schema::hasColumn('national_participants', 'shirt_size')) {
                    $table->dropColumn('shirt_size');
                }
            });
        }
    }
};
