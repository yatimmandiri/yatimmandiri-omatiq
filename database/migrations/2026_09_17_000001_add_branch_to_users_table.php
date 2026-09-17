<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users') && ! Schema::hasColumn('users', 'branch')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('branch')->nullable()->index()->after('phone_otp_last_sent_at');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'branch')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('branch');
            });
        }
    }
};
