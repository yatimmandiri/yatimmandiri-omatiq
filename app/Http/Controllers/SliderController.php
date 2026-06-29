<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreSliderRequest;
use App\Http\Requests\Company\UpdateSliderRequest;
use App\Models\Company\Category;
use App\Models\Company\Olimpiade;
use App\Models\Company\Slider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SliderController extends Controller
{
    use LogActivity, UploadFiles;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Slider::class);

        $data = [];

        return Inertia::render('admin/company/slider/list', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Slider::class);

        $olimpiades = Olimpiade::select(['id', 'name'])->get();

        $data = [
            'olimpiades' => $olimpiades
        ];

        return Inertia::render('admin/company/slider/create', $data);
    }

    /**
     * Store a newly Created resource in storage.
     */
    public function store(StoreSliderRequest $request)
    {
        $this->authorize('create', Slider::class);

        $data = [
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'url' => $request->url,
            'video_url' => $request->video_url,
            'olimpiade_id' => $request->olimpiade_id,
        ];

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $this->uploadFile(null, $request->file('featured_image'), 'uploads/slider');
        }

        $slider = Slider::create($data);

        if ($slider) {
            $this->logSuccess('create-slider', "Created Slider: {$slider->name}", [
                'slider_id' => $slider->id,
                'new_data' => $slider->toArray(),
            ]);
        } else {
            $this->logError('create-slider', "Failed to create Slider: {$slider->name}", [
                'slider_id' => $slider->id,
                'new_data' => $slider->toArray(),
            ]);
        }

        return redirect()->route('admin.companies.sliders.index')->with('success', 'Slider Created Successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Slider $slider)
    {
        $this->authorize('view', $slider);

        $slider->load('olimpiade');

        $data = [
            'slider' => $slider,
        ];

        return Inertia::render('admin/company/slider/show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Slider $slider)
    {
        $this->authorize('update', $slider);

        $olimpiades = Olimpiade::select(['id', 'name'])->get();

        $data = [
            'slider' => $slider,
            'olimpiades' => $olimpiades
        ];

        return Inertia::render('admin/company/slider/edit', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSliderRequest $request, Slider $slider)
    {
        $this->authorize('update', $slider);

        $data = $request->only(['title', 'subtitle', 'url', 'video_url', 'olimpiade_id']);

        $oldData = $slider->replicate();

        if ($request->hasFile('featured_image')) {
            $this->deleteFile($oldData->featured_image);

            $data['featured_image'] = $this->uploadFile($slider->featured_image, $request->file('featured_image'), 'uploads/slider');
        }

        $slider->update($data);

        if ($slider) {
            $this->logSuccess('update-slider', "Update Slider: {$slider->name}", [
                'slider_id' => $slider->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $slider->toArray(),
            ]);
        } else {
            $this->logError('update-slider', "Failed to update Slider: {$slider->name}", [
                'slider_id' => $slider->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $slider->toArray(),
            ]);
        }

        return redirect()->route('admin.companies.sliders.index')->with('success', 'Slider Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Slider $slider)
    {
        $this->authorize('delete', $slider);

        $slider->delete();

        if ($slider) {
            $this->logSuccess('delete-slider', "Delete Slider: {$slider->name}", ['slider_id' => $slider->id]);
        } else {
            $this->logError('delete-slider', "Failed to delete Slider: {$slider->name}", ['slider_id' => $slider->id]);
        }

        return redirect()->route('admin.companies.sliders.index')->with('success', 'Slider Deleted Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-slider', Slider::class);

        $perPage = $request->input('perPage', null);
        $page = $request->input('page', null);
        $globalSearch = $request->input('globalSearch', '');
        $orderBy = $request->input('orderBy', 'id');
        $orderDirection = $request->input('orderDirection', 'desc');
        $filterValue = $request->input('filterValue', []);

        $query = Slider::query()
            ->latest()
            ->search($globalSearch)
            ->orderBy($orderBy, $orderDirection);

        $data = $perPage
            ? $query->paginate($perPage, ['*'], 'page', $page)
            : $query->get();

        return response()->json($data);
    }
}