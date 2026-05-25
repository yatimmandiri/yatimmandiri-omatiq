<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\SiteSetttingsRequest;
use App\Settings\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SiteSettingsController extends Controller
{
    use LogActivity, UploadFiles;

    public function edit()
    {
        $data['settings'] = app(SiteSettings::class);

        return Inertia::render('admin/settings/site', $data);
    }

    public function update(SiteSetttingsRequest $request)
    {
        $settings = app(SiteSettings::class);

        foreach ($request->all() as $key => $value) {
            // Skip jika null, empty string, atau array kosong
            if (
                is_null($value) ||
                $value === '' ||
                (is_array($value) && empty($value))
            ) {
                continue;
            }

            // Upload file
            if (
                in_array($key, ['logo', 'favicon']) &&
                $request->hasFile($key)
            ) {
                $settings->$key = $this->uploadFile(
                    $settings->$key,
                    $request->file($key),
                    "settings/{$key}"
                );

                continue;
            }

            $settings->$key = $value;
        }

        $settings->save();

        if ($settings) {
            $this->logSuccess('update-site-settings', "Update Site Settings", [
                'name' => $request['site_name'],
            ]);
        } else {
            $this->logError('update-site-settings', "Update Site Settings", [
                'name' => $request['site_name'],
            ]);
        }

        return back()->with('success', 'Site Settings Update Successfully');
    }

    public function editorUploadFile(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimetypes:image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,video/mp4,video/webm,video/ogg',
                'max:15360', // 15MB
            ],
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();

        $isVideo = str_starts_with($mime, 'video');
        $folder = $isVideo ? 'videos' : 'uploads';

        $path = $file->store($folder, 'public');

        return response()->json([
            'url' => Storage::url($path),
            'type' => $isVideo ? 'video' : 'image',
        ]);
    }

    public function editorDeleteFile(Request $request)
    {
        $request->validate([
            'url' => 'required|string'
        ]);

        $url = $request->input('url');

        // Ambil path dari URL
        $path = parse_url($url, PHP_URL_PATH);

        // Hilangkan /storage/
        $path = str_replace('/storage/', '', $path);

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);

            return response()->json([
                'success' => true
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'File not found'
        ], 404);
    }
}
