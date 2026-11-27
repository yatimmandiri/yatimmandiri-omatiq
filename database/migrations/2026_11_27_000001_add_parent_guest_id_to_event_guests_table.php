<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_guests', function (Blueprint $table) {
            $table->foreignId('parent_guest_id')
                ->nullable()
                ->after('id')
                ->constrained('event_guests')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('event_guests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_guest_id');
        });
    }
};
