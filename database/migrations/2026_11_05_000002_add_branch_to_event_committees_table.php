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
        if (Schema::hasTable('event_committees') && ! Schema::hasColumn('event_committees', 'branch')) {
            Schema::table('event_committees', function (Blueprint $table) {
                $table->string('branch', 100)->nullable()->index()->after('name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('event_committees') && Schema::hasColumn('event_committees', 'branch')) {
            Schema::table('event_committees', function (Blueprint $table) {
                $table->dropIndex(['branch']);
                $table->dropColumn('branch');
            });
        }
    }
};
