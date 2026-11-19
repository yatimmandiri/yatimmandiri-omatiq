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
        Schema::create('event_consumption_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('consumable_type', ['participant', 'chaperone'])->index();
            $table->unsignedBigInteger('consumable_id')->index();
            $table->date('event_date')->index();
            $table->timestamp('redeemed_at');
            $table->foreignId('redeemed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('session_number')->default(1);
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['consumable_type', 'consumable_id', 'event_date'], 'ecl_target_date_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_consumption_logs');
    }
};
