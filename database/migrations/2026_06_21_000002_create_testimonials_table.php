<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['testimonial', 'public_figure'])->default('testimonial')->index();
            $table->string('name');
            $table->string('role');
            $table->text('quote');
            $table->string('avatar', 2048)->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->string('focus')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('status')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
