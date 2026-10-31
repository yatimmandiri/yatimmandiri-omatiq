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
        if (Schema::hasTable('national_participants')) {
            Schema::table('national_participants', function (Blueprint $table) {
                if (! Schema::hasColumn('national_participants', 'decline_category')) {
                    $table->string('decline_category', 50)->nullable()->after('registered_at');
                }
                if (! Schema::hasColumn('national_participants', 'decline_reason')) {
                    $table->text('decline_reason')->nullable()->after('decline_category');
                }
                if (! Schema::hasColumn('national_participants', 'declined_at')) {
                    $table->timestamp('declined_at')->nullable()->after('decline_reason');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('national_participants')) {
            Schema::table('national_participants', function (Blueprint $table) {
                $columns = [];
                if (Schema::hasColumn('national_participants', 'decline_category')) {
                    $columns[] = 'decline_category';
                }
                if (Schema::hasColumn('national_participants', 'decline_reason')) {
                    $columns[] = 'decline_reason';
                }
                if (Schema::hasColumn('national_participants', 'declined_at')) {
                    $columns[] = 'declined_at';
                }
                if (! empty($columns)) {
                    $table->dropColumn($columns);
                }
            });
        }
    }
};
