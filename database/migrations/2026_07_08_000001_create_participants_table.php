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
            $table->string('registration_number')->unique();
            $table->foreignId('olimpiade_id')->constrained('olimpiades')->restrictOnDelete();
            $table->string('full_name');
            $table->string('nickname')->nullable();
            $table->string('gender', 20);
            $table->string('birth_place');
            $table->date('birth_date');
            $table->unsignedTinyInteger('age');
            $table->string('education_level', 20);
            $table->string('school_name');
            $table->string('grade', 30);
            $table->text('address');
            $table->char('province_id', 2)->nullable();
            $table->char('regency_id', 4)->nullable();
            $table->string('parent_phone', 30);
            $table->string('development_program');
            $table->string('development_program_other')->nullable();
            $table->string('institution_name')->nullable();
            $table->string('branch_office')->nullable();
            $table->string('mentor_name')->nullable();
            $table->string('mentor_phone', 30)->nullable();
            $table->text('achievements')->nullable();
            $table->boolean('has_joined_before')->default(false);
            $table->year('previous_year')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('identity_card_path')->nullable();
            $table->string('recommendation_letter_path')->nullable();
            $table->string('achievement_certificate_path')->nullable();
            $table->boolean('data_truth_consent')->default(false);
            $table->boolean('documentation_consent')->default(false);
            $table->boolean('rules_consent')->default(false);
            $table->string('participant_signature_name')->nullable();
            $table->string('guardian_signature_name')->nullable();
            $table->string('status', 30)->default('submitted');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete();
            $table->foreign('regency_id')->references('id')->on('regencies')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
