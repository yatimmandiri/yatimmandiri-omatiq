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
        Schema::create('event_check_in_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('target_type', ['participant', 'chaperone', 'committee', 'guest'])->index();
            $table->unsignedBigInteger('target_id')->index();
            $table->date('event_date')->index();
            $table->unsignedTinyInteger('day_number')->default(1)->index();
            $table->string('checkpoint', 50)->default('penginapan')->index();
            $table->string('checkpoint_label', 100)->default('Penginapan / Asrama');
            $table->timestamp('checked_in_at')->index();
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(
                ['target_type', 'target_id', 'event_date', 'checkpoint'],
                'ecil_target_date_checkpoint_unique'
            );
            $table->index(['event_date', 'day_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_check_in_logs');
    }
};
