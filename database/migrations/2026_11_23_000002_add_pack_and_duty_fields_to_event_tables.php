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
        Schema::table('national_participants', function (Blueprint $table) {
            $table->timestamp('pack_received_at')->nullable()->after('shirt_size');
            $table->foreignId('pack_received_by')->nullable()->after('pack_received_at')->constrained('users')->nullOnDelete();
        });

        Schema::table('national_chaperones', function (Blueprint $table) {
            $table->timestamp('pack_received_at')->nullable()->after('notes');
            $table->foreignId('pack_received_by')->nullable()->after('pack_received_at')->constrained('users')->nullOnDelete();
        });

        Schema::table('event_committees', function (Blueprint $table) {
            $table->json('daily_duties')->nullable()->after('access_zone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('national_participants', function (Blueprint $table) {
            $table->dropForeign(['pack_received_by']);
            $table->dropColumn(['pack_received_at', 'pack_received_by']);
        });

        Schema::table('national_chaperones', function (Blueprint $table) {
            $table->dropForeign(['pack_received_by']);
            $table->dropColumn(['pack_received_at', 'pack_received_by']);
        });

        Schema::table('event_committees', function (Blueprint $table) {
            $table->dropColumn(['daily_duties']);
        });
    }
};
