<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Concerns\Trait\LogActivity;
use App\Concerns\Trait\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\SiteSetttingsRequest;
use App\Settings\SiteSetting;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;

class SiteSettingsController extends Controller
{
    use LogActivity, UploadFiles;

    public function edit()
    {
        $data['settings'] = app(SiteSetting::class);

        return Inertia::render('admin/settings/site', $data);
    }

    public function update(SiteSetttingsRequest $request, SiteSetting $settings)
    {
        foreach ($request->all() as $key => $value) {
            if (in_array($key, ['logo', 'favicon'])) {
                if ($value instanceof UploadedFile) {
                    $settings->$key = $this->uploadFile(
                        $settings->$key,
                        $value,
                        "settings/$key"
                    );
                }
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
}
