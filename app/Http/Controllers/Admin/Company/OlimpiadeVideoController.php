<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreOlimpiadeVideoRequest;
use App\Http\Requests\Company\UpdateOlimpiadeVideoRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\OlimpiadeVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OlimpiadeVideoController extends Controller
{
    use LogActivity, UploadFiles;

    public function index(): Response
    {
        $this->authorize('viewAny', OlimpiadeVideo::class);

        return Inertia::render('admin/company/olimpiade-video/list');
    }

    public function create(): Response
    {
        $this->authorize('create', OlimpiadeVideo::class);

        return Inertia::render('admin/company/olimpiade-video/create', $this->formOptions());
    }

    public function store(StoreOlimpiadeVideoRequest $request)
    {
        $this->authorize('create', OlimpiadeVideo::class);
        $video = OlimpiadeVideo::create($this->payload($request));
        $this->logSuccess('create-olimpiade-video', "Created video: {$video->title}", ['video_id' => $video->id]);

        return redirect()->route('admin.companies.olimpiade-videos.index')->with('success', 'Video Created Successfully');
    }

    public function show(OlimpiadeVideo $olimpiadeVideo): Response
    {
        $this->authorize('view', $olimpiadeVideo);

        return Inertia::render('admin/company/olimpiade-video/show', ['item' => $olimpiadeVideo->load('olimpiade')]);
    }

    public function edit(OlimpiadeVideo $olimpiadeVideo): Response
    {
        $this->authorize('update', $olimpiadeVideo);

        return Inertia::render('admin/company/olimpiade-video/edit', ['item' => $olimpiadeVideo, ...$this->formOptions()]);
    }

    public function update(UpdateOlimpiadeVideoRequest $request, OlimpiadeVideo $olimpiadeVideo)
    {
        $this->authorize('update', $olimpiadeVideo);
        $olimpiadeVideo->update($this->payload($request, $olimpiadeVideo));
        $this->logSuccess('update-olimpiade-video', "Updated video: {$olimpiadeVideo->title}", ['video_id' => $olimpiadeVideo->id]);

        return redirect()->route('admin.companies.olimpiade-videos.index')->with('success', 'Video Updated Successfully');
    }

    public function destroy(OlimpiadeVideo $olimpiadeVideo)
    {
        $this->authorize('delete', $olimpiadeVideo);
        $title = $olimpiadeVideo->title;
        $this->deleteThumbnail($olimpiadeVideo->thumbnail_url);
        $olimpiadeVideo->delete();
        $this->logSuccess('delete-olimpiade-video', "Deleted video: {$title}");

        return redirect()->route('admin.companies.olimpiade-videos.index')->with('success', 'Video Deleted Successfully');
    }

    public function status(OlimpiadeVideo $olimpiadeVideo)
    {
        $this->authorize('update', $olimpiadeVideo);
        $olimpiadeVideo->update(['status' => ! $olimpiadeVideo->status]);

        return back()->with('success', 'Video Status Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-olimpiade-video', OlimpiadeVideo::class);
        $allowed = ['id', 'title', 'tag', 'sort_order', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'sort_order';
        $direction = strtolower((string) $request->input('orderDirection')) === 'desc' ? 'desc' : 'asc';
        $query = OlimpiadeVideo::query()->with('olimpiade:id,name')->search($request->string('globalSearch')->toString())->orderBy($orderBy, $direction)->orderBy('id');
        $data = $request->integer('perPage') ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null) : $query->get();

        return response()->json($data);
    }

    private function payload(
        StoreOlimpiadeVideoRequest|UpdateOlimpiadeVideoRequest $request,
        ?OlimpiadeVideo $video = null,
    ): array {
        $data = $request->safe()->except(['thumbnail']);

        if ($request->hasFile('thumbnail')) {
            $oldPath = $video?->thumbnail_url;
            $data['thumbnail_url'] = $this->uploadFile(
                $oldPath && ! Str::startsWith($oldPath, ['http://', 'https://']) ? $oldPath : null,
                $request->file('thumbnail'),
                'uploads/olimpiade/videos',
            );
        }

        $data['status'] = $request->has('status') ? $request->boolean('status') : true;

        return $data;
    }

    private function deleteThumbnail(?string $path): void
    {
        if ($path && ! Str::startsWith($path, ['http://', 'https://'])) {
            $this->deleteFile($path);
        }
    }

    private function formOptions(): array
    {
        return ['olimpiades' => Olimpiade::query()->ordered()->get(['id', 'name'])];
    }
}
