<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreSliderRequest;
use App\Http\Requests\Company\UpdateSliderRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SliderController extends Controller
{
    use LogActivity, UploadFiles;

    public function index(): Response
    {
        $this->authorize('viewAny', Slider::class);

        return Inertia::render('admin/company/slider/list');
    }

    public function create(): Response
    {
        $this->authorize('create', Slider::class);

        return Inertia::render('admin/company/slider/create', $this->formOptions());
    }

    public function store(StoreSliderRequest $request)
    {
        $this->authorize('create', Slider::class);
        $slider = Slider::create($this->payload($request));
        $this->logSuccess('create-slider', "Created slider: {$slider->title}", ['slider_id' => $slider->id]);

        return redirect()->route('admin.companies.sliders.index')->with('success', 'Slider Created Successfully');
    }

    public function show(Slider $slider): Response
    {
        $this->authorize('view', $slider);

        return Inertia::render('admin/company/slider/show', ['slider' => $slider->load('olimpiade')]);
    }

    public function edit(Slider $slider): Response
    {
        $this->authorize('update', $slider);

        return Inertia::render('admin/company/slider/edit', ['slider' => $slider, ...$this->formOptions()]);
    }

    public function update(UpdateSliderRequest $request, Slider $slider)
    {
        $this->authorize('update', $slider);
        $slider->update($this->payload($request, $slider));
        $this->logSuccess('update-slider', "Updated slider: {$slider->title}", ['slider_id' => $slider->id]);

        return redirect()->route('admin.companies.sliders.index')->with('success', 'Slider Updated Successfully');
    }

    public function destroy(Slider $slider)
    {
        $this->authorize('delete', $slider);
        $this->deleteImage($slider->featured_image);
        $title = $slider->title;
        $slider->delete();
        $this->logSuccess('delete-slider', "Deleted slider: {$title}");

        return redirect()->route('admin.companies.sliders.index')->with('success', 'Slider Deleted Successfully');
    }

    public function status(Slider $slider)
    {
        $this->authorize('update', $slider);
        $slider->update(['status' => ! $slider->status]);

        return back()->with('success', 'Slider Status Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-slider', Slider::class);
        $allowed = ['id', 'title', 'sort_order', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'sort_order';
        $direction = strtolower((string) $request->input('orderDirection')) === 'desc' ? 'desc' : 'asc';
        $query = Slider::query()->with('olimpiade:id,name')->search($request->string('globalSearch')->toString())->orderBy($orderBy, $direction)->orderBy('id');
        $data = $request->integer('perPage') ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null) : $query->get();

        return response()->json($data);
    }

    private function payload(StoreSliderRequest|UpdateSliderRequest $request, ?Slider $slider = null): array
    {
        $data = $request->safe()->except(['featured_image']);
        if ($request->hasFile('featured_image')) {
            $oldPath = $slider?->featured_image;
            $data['featured_image'] = $this->uploadFile(
                $oldPath && ! Str::startsWith($oldPath, ['http://', 'https://']) ? $oldPath : null,
                $request->file('featured_image'),
                'uploads/sliders',
            );
        }
        $data['status'] = $request->has('status') ? $request->boolean('status') : true;

        return $data;
    }

    private function deleteImage(?string $path): void
    {
        if ($path && ! Str::startsWith($path, ['http://', 'https://'])) {
            $this->deleteFile($path);
        }
    }

    private function formOptions(): array
    {
        return ['olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'slug'])];
    }
}
