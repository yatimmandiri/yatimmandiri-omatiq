<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('olimpiade_objectives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('olimpiade_id')->nullable()->constrained()->nullOnDelete();
            $table->string('icon')->nullable();
            $table->string('title');
            $table->text('text');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('olimpiade_galleries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('olimpiade_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title')->nullable();
            $table->string('image_url', 2048);
            $table->string('alt_text')->nullable();
            $table->text('caption')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('olimpiade_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('olimpiade_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('embed_url', 2048);
            $table->string('thumbnail_url', 2048)->nullable();
            $table->string('duration', 30)->nullable();
            $table->string('tag')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('olimpiade_videos');
        Schema::dropIfExists('olimpiade_galleries');
        Schema::dropIfExists('olimpiade_objectives');
    }
};
