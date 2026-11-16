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
        Schema::table('event_guests', function (Blueprint $table) {
            $table->string('rsvp_token', 64)->nullable()->unique()->after('status');
            $table->timestamp('invitation_sent_at')->nullable()->after('rsvp_token');
            $table->timestamp('confirmed_at')->nullable()->after('invitation_sent_at');
            $table->string('category', 50)->default('vip')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_guests', function (Blueprint $table) {
            $table->dropColumn(['rsvp_token', 'invitation_sent_at', 'confirmed_at']);
        });
    }
};
