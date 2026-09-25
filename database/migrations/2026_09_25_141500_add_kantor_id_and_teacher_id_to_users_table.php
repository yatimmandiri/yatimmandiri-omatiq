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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'kantor_id')) {
                $table->unsignedBigInteger('kantor_id')->nullable()->index()->after('branch');
            }

            if (! Schema::hasColumn('users', 'teacher_id')) {
                $table->unsignedBigInteger('teacher_id')->nullable()->index()->after('kantor_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(array_filter([
                Schema::hasColumn('users', 'kantor_id') ? 'kantor_id' : null,
                Schema::hasColumn('users', 'teacher_id') ? 'teacher_id' : null,
            ]));
        });
    }
};
