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
        Schema::create('event_guests', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('institution', 150)->nullable();
            $table->string('position', 150)->nullable();
            $table->enum('category', ['vvip', 'vip', 'tokoh', 'sponsor', 'umum'])->default('vip')->index();
            $table->string('phone', 30)->nullable()->index();
            $table->string('email')->nullable();
            $table->string('table_number', 50)->nullable();
            $table->unsignedSmallInteger('seat_count')->default(1);
            $table->string('photo_path')->nullable();
            $table->enum('status', ['invited', 'confirmed', 'attended', 'declined'])->default('confirmed')->index();
            $table->timestamp('checked_in_at')->nullable()->index();
            $table->text('notes')->nullable();
            $table->smallInteger('event_year')->default(2026)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['event_year', 'status']);
            $table->index(['category', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_guests');
    }
};
