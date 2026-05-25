<?php

namespace App\Concerns\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

trait LogActivity
{
    protected function logActivity(string $type, string $action, ?string $message = null, array $context = []): void
    {
        $user = Auth::user();

        $messageLog = strtoupper($type) . " [ACTION: {$action}]";

        $messageLog .= $user
            ? " by {$user->name} (ID: {$user->id})"
            : " by guest";

        if ($message) {
            $messageLog .= " - {$message}";
        }

        $baseContext = [
            'type' => $type,
            'action' => $action,
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'ip' => request()->ip(),
            'agent' => request()->userAgent(),
        ];

        $context = array_merge($baseContext, $context);

        match ($type) {
            'error' => Log::error($messageLog, $context),
            'warning' => Log::warning($messageLog, $context),
            'info', 'success' => Log::info($messageLog, $context),
            default => Log::info($messageLog, $context),
        };
    }

    protected function logSuccess(string $action, ?string $message = null, array $context = [])
    {
        $this->logActivity('success', $action, $message, $context);
    }

    protected function logError(string $action, ?string $message = null, array $context = [])
    {
        $this->logActivity('error', $action, $message, $context);
    }

    protected function logWarning(string $action, ?string $message = null, array $context = [])
    {
        $this->logActivity('warning', $action, $message, $context);
    }

    protected function logInfo(string $action, ?string $message = null, array $context = [])
    {
        $this->logActivity('info', $action, $message, $context);
    }
}
