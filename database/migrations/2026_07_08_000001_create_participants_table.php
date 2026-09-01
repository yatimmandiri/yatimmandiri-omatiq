<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
            $table->char('nik', 16)->nullable();
            $table->unsignedBigInteger('penyaluran_sanggar_id')->nullable()->index();
            $table->string('penyaluran_sanggar_name')->nullable();
            $table->string('registration_number')->unique();
            $table->string('registration_type', 20)->default('public');
            $table->foreignId('mentor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('olimpiade_id')->constrained('olimpiades')->restrictOnDelete();
            $table->year('event_year')->nullable()->index();
            $table->text('achievements')->nullable();
            $table->boolean('has_joined_before')->default(false);
            $table->year('previous_year')->nullable();
            $table->string('referral_source')->nullable();
            $table->string('branch')->nullable();
            $table->string('payment_status', 30)->default('unpaid');
            $table->string('payment_proof_path')->nullable();
            $table->decimal('payment_amount', 12, 2)->nullable();
            $table->text('payment_note')->nullable();
            $table->boolean('data_truth_consent')->default(false);
            $table->boolean('documentation_consent')->default(false);
            $table->boolean('rules_consent')->default(false);
            $table->string('participant_signature_name')->nullable();
            $table->string('guardian_signature_name')->nullable();
            $table->string('status', 30)->default('submitted');
            $table->text('notes')->nullable();
            $table->index('status');
            $table->index('registration_type');
            $table->index('payment_status');
            $table->index('branch');
            $table->index(['olimpiade_id', 'status']);
            $table->index(['event_year', 'status']);
            $table->index(['registration_type', 'status']);
            $table->index(['payment_status', 'status']);
            $table->index(['mentor_id', 'created_at']);
            $table->index('created_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
