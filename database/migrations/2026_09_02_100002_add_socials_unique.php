<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('socials')) {
            // Fix legacy TEXT provider_id → VARCHAR for MySQL unique without key length
            if (Schema::hasColumn('socials', 'provider_id')) {
                try {
                    $type = DB::getSchemaBuilder()->getColumnType('socials', 'provider_id');
                    if (str_contains(strtolower($type), 'text') || str_contains(strtolower($type), 'blob')) {
                        // Use raw statement to avoid doctrine/dbal requirement
                        if (DB::getDriverName() === 'mysql') {
                            DB::statement('ALTER TABLE `socials` MODIFY `provider_id` VARCHAR(255) NULL');
                        } else {
                            Schema::table('socials', function (Blueprint $table) {
                                $table->string('provider_id', 255)->nullable()->change();
                            });
                        }
                    }
                } catch (Throwable $e) {
                }
            }

            $hasProviderProviderId = false;
            $hasUserProvider = false;
            try {
                $indexes = Schema::getIndexes('socials');
                foreach ($indexes as $idx) {
                    $cols = $idx['columns'] ?? [];
                    if ($cols === ['provider', 'provider_id']) {
                        $hasProviderProviderId = true;
                    }
                    if ($cols === ['user_id', 'provider']) {
                        $hasUserProvider = true;
                    }
                }
            } catch (Throwable $e) {
            }

            Schema::table('socials', function (Blueprint $table) use ($hasProviderProviderId, $hasUserProvider) {
                if (! $hasProviderProviderId) {
                    $table->unique(['provider', 'provider_id']);
                }
                if (! $hasUserProvider) {
                    $table->unique(['user_id', 'provider']);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('socials')) {
            Schema::table('socials', function (Blueprint $table) {
                try {
                    $table->dropUnique(['provider', 'provider_id']);
                } catch (Throwable $e) {
                }
                try {
                    $table->dropUnique(['user_id', 'provider']);
                } catch (Throwable $e) {
                }
            });
        }
    }
};
