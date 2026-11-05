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
        Schema::create('event_committees', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('nik', 16)->nullable();
            $table->enum('gender', ['male', 'female'])->default('male');
            $table->string('phone', 30)->nullable()->index();
            $table->string('email')->nullable();
            $table->string('division', 100)->index();
            $table->string('position', 100)->nullable();
            $table->string('access_zone', 100)->default('All Access');
            $table->string('photo_path')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active')->index();
            $table->timestamp('checked_in_at')->nullable()->index();
            $table->text('notes')->nullable();
            $table->smallInteger('event_year')->default(2026)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['event_year', 'status']);
            $table->index(['division', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_committees');
    }
};
