<?php

namespace App\Concerns\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait UploadFiles
{
    public function uploadFile(?string $oldPath, UploadedFile $file, string $folder, string $disk = 'public'): string
    {
        if ($oldPath && Storage::disk($disk)->exists($oldPath)) {
            Storage::disk($disk)->delete($oldPath);
        }

        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();

        return $file->storeAs($folder, $fileName, $disk);
    }

    public function deleteFile(?string $path, string $disk = 'public'): void
    {
        if ($path && Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }

    public function replaceFile(?string $oldPath, UploadedFile $file, string $folder, string $disk = 'public'): string
    {
        $this->deleteFile($oldPath, $disk);

        return $this->uploadFile(null, $file, $folder, $disk);
    }
}
