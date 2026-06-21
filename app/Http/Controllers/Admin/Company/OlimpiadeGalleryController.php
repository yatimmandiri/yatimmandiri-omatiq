<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreOlimpiadeGalleryRequest;
use App\Http\Requests\Company\UpdateOlimpiadeGalleryRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\OlimpiadeGallery;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OlimpiadeGalleryController extends Controller
{
    use LogActivity, UploadFiles;

    public function index(): Response
    {
        $this->authorize('viewAny', OlimpiadeGallery::class);

        return Inertia::render('admin/company/olimpiade-gallery/list');
    }

    public function create(): Response
    {
        $this->authorize('create', OlimpiadeGallery::class);

        return Inertia::render('admin/company/olimpiade-gallery/create', $this->formOptions());
    }

    public function store(StoreOlimpiadeGalleryRequest $request)
    {
        $this->authorize('create', OlimpiadeGallery::class);
        $gallery = OlimpiadeGallery::create($this->payload($request));
        $this->logSuccess('create-olimpiade-gallery', "Created gallery: {$gallery->title}", ['gallery_id' => $gallery->id]);

        return redirect()->route('admin.companies.olimpiade-galleries.index')->with('success', 'Gallery Created Successfully');
    }

    public function show(OlimpiadeGallery $olimpiadeGallery): Response
    {
        $this->authorize('view', $olimpiadeGallery);

        return Inertia::render('admin/company/olimpiade-gallery/show', ['item' => $olimpiadeGallery->load('olimpiade')]);
    }

    public function edit(OlimpiadeGallery $olimpiadeGallery): Response
    {
        $this->authorize('update', $olimpiadeGallery);

        return Inertia::render('admin/company/olimpiade-gallery/edit', ['item' => $olimpiadeGallery, ...$this->formOptions()]);
    }

    public function update(UpdateOlimpiadeGalleryRequest $request, OlimpiadeGallery $olimpiadeGallery)
    {
        $this->authorize('update', $olimpiadeGallery);
        $olimpiadeGallery->update($this->payload($request, $olimpiadeGallery));
        $this->logSuccess('update-olimpiade-gallery', "Updated gallery: {$olimpiadeGallery->title}", ['gallery_id' => $olimpiadeGallery->id]);

        return redirect()->route('admin.companies.olimpiade-galleries.index')->with('success', 'Gallery Updated Successfully');
    }

    public function destroy(OlimpiadeGallery $olimpiadeGallery)
    {
        $this->authorize('delete', $olimpiadeGallery);
        if (! Str::startsWith($olimpiadeGallery->image_url, ['http://', 'https://'])) {
            $this->deleteFile($olimpiadeGallery->image_url);
        }
        $title = $olimpiadeGallery->title;
        $olimpiadeGallery->delete();
        $this->logSuccess('delete-olimpiade-gallery', "Deleted gallery: {$title}");

        return redirect()->route('admin.companies.olimpiade-galleries.index')->with('success', 'Gallery Deleted Successfully');
    }

    public function status(OlimpiadeGallery $olimpiadeGallery)
    {
        $this->authorize('update', $olimpiadeGallery);
        $olimpiadeGallery->update(['status' => ! $olimpiadeGallery->status]);

        return back()->with('success', 'Gallery Status Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-olimpiade-gallery', OlimpiadeGallery::class);
        $allowed = ['id', 'title', 'sort_order', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'sort_order';
        $direction = strtolower((string) $request->input('orderDirection')) === 'desc' ? 'desc' : 'asc';
        $query = OlimpiadeGallery::query()->with('olimpiade:id,name')->search($request->string('globalSearch')->toString())->orderBy($orderBy, $direction)->orderBy('id');
        $data = $request->integer('perPage') ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null) : $query->get();

        return response()->json($data);
    }

    private function payload(StoreOlimpiadeGalleryRequest|UpdateOlimpiadeGalleryRequest $request, ?OlimpiadeGallery $gallery = null): array
    {
        $data = $request->safe()->except(['image', 'image_url']);
        if ($request->hasFile('image')) {
            $data['image_url'] = $this->uploadFile($gallery?->image_url, $request->file('image'), 'uploads/olimpiade/gallery');
        } elseif ($request->filled('image_url')) {
            if ($gallery && ! Str::startsWith($gallery->image_url, ['http://', 'https://'])) {
                $this->deleteFile($gallery->image_url);
            }
            $data['image_url'] = $request->string('image_url')->toString();
        }
        $data['status'] = $request->has('status') ? $request->boolean('status') : true;

        return $data;
    }

    private function formOptions(): array
    {
        return ['olimpiades' => Olimpiade::query()->ordered()->get(['id', 'name'])];
    }
}
