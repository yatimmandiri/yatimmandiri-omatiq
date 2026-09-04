<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->char('nik', 16);
            $table->string('full_name');
            $table->string('nickname')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('school_name')->nullable();
            $table->string('school_level', 30)->nullable();
            $table->string('grade', 30)->nullable();
            $table->string('nis', 20)->nullable();
            $table->text('address')->nullable();
            $table->char('province_id', 2)->nullable();
            $table->char('regency_id', 4)->nullable();
            $table->char('district_id', 7)->nullable();
            $table->char('village_id', 10)->nullable();
            $table->unsignedBigInteger('penyaluran_id')->nullable()->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('parent_phone', 30)->nullable();
            $table->foreignId('mentor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('mentor_name')->nullable();
            $table->string('mentor_phone', 30)->nullable();
            $table->string('photo_path')->nullable();
            $table->string('identity_card_path')->nullable();
            $table->string('family_card_path')->nullable();
            $table->string('student_card_path')->nullable();
            $table->boolean('is_binaan')->default(false);
            $table->boolean('is_active')->default(true)->index();
            $table->index('province_id');
            $table->index('regency_id');
            $table->index('district_id');
            $table->index('village_id');
            $table->index('penyaluran_id');
            $table->index('school_name');
            $table->index('is_binaan');
            $table->index(['mentor_id', 'created_at']);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['nik', 'deleted_at']);

            $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete();
            $table->foreign('regency_id')->references('id')->on('regencies')->nullOnDelete();
            $table->foreign('district_id')->references('id')->on('districts')->nullOnDelete();
            $table->foreign('village_id')->references('id')->on('villages')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
