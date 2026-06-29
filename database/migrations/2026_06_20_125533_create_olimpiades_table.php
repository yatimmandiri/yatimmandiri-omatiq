<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('olimpiades', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->index();
            $table->text('excerpt')->nullable();
            $table->longText('description')->nullable();
            $table->string('featured_image')->nullable();
            $table->string('duration')->nullable();
            $table->string('level')->nullable();
            $table->json('benefits')->nullable();
            $table->string('overview_title')->nullable();
            $table->text('overview_description')->nullable();
            $table->json('objectives')->nullable();
            $table->json('gallery')->nullable();
            $table->json('videos')->nullable();
            $table->text('cta_description')->nullable();
            $table->string('registration_url')->nullable();
            $table->boolean('status')->default(true)->index();
            $table->boolean('recommended')->default(false)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('olimpiades');
    }
};
