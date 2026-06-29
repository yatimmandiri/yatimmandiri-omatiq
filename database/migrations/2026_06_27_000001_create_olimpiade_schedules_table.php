<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('olimpiade_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('olimpiade_id')->constrained('olimpiades')->cascadeOnDelete();
            $table->string('title');
            $table->string('phase')->default('registration');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->string('action_label')->nullable();
            $table->string('action_url')->nullable();
            $table->string('color')->nullable();
            $table->boolean('status')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('olimpiade_schedules');
    }
};
