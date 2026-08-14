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
            $table->string('gender', 20);
            $table->string('birth_place');
            $table->date('birth_date');
            $table->unsignedTinyInteger('age');
            $table->string('school_name');
            $table->string('grade', 30);
            $table->text('address');
            $table->char('province_id', 2)->nullable();
            $table->char('regency_id', 4)->nullable();
            $table->string('parent_phone', 30);
            $table->foreignId('mentor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('mentor_name')->nullable();
            $table->string('mentor_phone', 30)->nullable();
            $table->string('photo_path')->nullable();
            $table->string('identity_card_path')->nullable();
            $table->string('family_card_path')->nullable();
            $table->boolean('is_binaan')->default(false);
            $table->index('province_id');
            $table->index('regency_id');
            $table->index('school_name');
            $table->index('is_binaan');
            $table->index(['mentor_id', 'created_at']);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['nik', 'deleted_at']);

            $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete();
            $table->foreign('regency_id')->references('id')->on('regencies')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
