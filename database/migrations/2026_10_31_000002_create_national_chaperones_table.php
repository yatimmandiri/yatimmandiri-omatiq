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
        Schema::create('national_chaperones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('branch', 100)->index();
            $table->unsignedBigInteger('kantor_id')->nullable()->index();
            $table->enum('source_type', ['guru', 'karyawan', 'lainnya'])->default('karyawan');
            $table->unsignedBigInteger('penyaluran_teacher_id')->nullable()->index();
            $table->string('name');
            $table->string('nik', 16);
            $table->enum('gender', ['male', 'female'])->default('male');
            $table->string('phone', 30);
            $table->string('email')->nullable();
            $table->string('position', 100)->nullable();
            $table->string('birth_place', 100)->nullable();
            $table->date('birth_date')->nullable();
            $table->text('address')->nullable();
            $table->char('province_id', 2)->nullable();
            $table->char('regency_id', 4)->nullable();
            $table->char('district_id', 7)->nullable();
            $table->char('village_id', 10)->nullable();
            $table->enum('status', ['submitted', 'verified', 'rejected'])->default('submitted')->index();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['branch', 'status']);
            $table->index(['kantor_id', 'status']);

            $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete();
            $table->foreign('regency_id')->references('id')->on('regencies')->nullOnDelete();
            $table->foreign('district_id')->references('id')->on('districts')->nullOnDelete();
            $table->foreign('village_id')->references('id')->on('villages')->nullOnDelete();
        });

        Schema::create('national_chaperone_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('national_chaperone_id')->constrained('national_chaperones')->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('participants')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['national_chaperone_id', 'participant_id'], 'chaperone_participant_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('national_chaperone_participants');
        Schema::dropIfExists('national_chaperones');
    }
};
