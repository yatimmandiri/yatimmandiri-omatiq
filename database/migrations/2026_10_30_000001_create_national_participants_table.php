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
        if (! Schema::hasTable('national_participants')) {
            Schema::create('national_participants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('participant_id')->unique()->constrained('participants')->cascadeOnDelete();
                $table->foreignId('qualified_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('qualified_at')->nullable();
                $table->string('status', 30)->default('unconfirmed'); // unconfirmed, waiting_confirmation, verified, rejected, declined
                $table->string('availability_letter_path')->nullable();
                $table->string('payment_proof_path')->nullable();
                $table->string('payment_status', 30)->default('unpaid'); // unpaid, waiting_confirmation, paid
                $table->decimal('payment_amount', 12, 2)->default(0.00);
                $table->timestamp('registered_at')->nullable();
                $table->string('decline_category', 50)->nullable();
                $table->text('decline_reason')->nullable();
                $table->timestamp('declined_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index('status');
                $table->index('payment_status');
                $table->index(['participant_id', 'status']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('national_participants');
    }
};
