<?php

namespace App\Concerns\Trait;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

trait LogActivity
{
    protected function logActivity(string $type, string $action, ?string $message = null, array $context = []): void
    {
        $user = Auth::user();
        $logMessage = strtoupper($type) . " [ACTION: {$action}]";

        if ($user) {
            $logMessage .= " by {$user->name} (ID: {$user->id})";
        } else {
            $logMessage .= " by guest";
        }

        if ($message) {
            $logMessage .= " - {$message}";
        }

        $context = array_merge([
            'type' => $type,
            'action' => $action,
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'ip' => request()->ip(),
            'agent' => request()->userAgent(),
        ], $context);

        $logType = $type === 'success' ? 'info' : $type;

        if (in_array($logType, ['info', 'warning', 'error'])) {
            Log::channel('single')->{$logType}($logMessage, $context);
        } else {
            Log::channel('single')->info($logMessage, $context);
        }
    }

    // Optional shortcut
    protected function logSuccess($action, $message = null, $context = [])
    {
        $this->logActivity('success', $action, $message, $context);
    }

    protected function logError($action, $message = null, $context = [])
    {
        $this->logActivity('error', $action, $message, $context);
    }

    protected function logWarning($action, $message = null, $context = [])
    {
        $this->logActivity('warning', $action, $message, $context);
    }

    protected function logInfo($action, $message = null, $context = [])
    {
        $this->logActivity('info', $action, $message, $context);
    }
}
