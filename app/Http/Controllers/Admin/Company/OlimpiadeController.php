<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreOlimpiadeRequest;
use App\Http\Requests\Company\UpdateOlimpiadeRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\OlimpiadeGallery;
use App\Models\Company\OlimpiadeObjective;
use App\Models\Company\OlimpiadeVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OlimpiadeController extends Controller
{
    use LogActivity, UploadFiles;

    public function index(): Response
    {
        $this->authorize('viewAny', Olimpiade::class);

        return Inertia::render('admin/company/olimpiade/list');
    }

    public function create(): Response
    {
        $this->authorize('create', Olimpiade::class);

        return Inertia::render('admin/company/olimpiade/create', $this->formOptions());
    }

    public function store(StoreOlimpiadeRequest $request)
    {
        $this->authorize('create', Olimpiade::class);

        $data = $this->payload($request);

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $this->uploadFile(
                null,
                $request->file('featured_image'),
                'uploads/olimpiade',
            );
        }

        $olimpiade = DB::transaction(function () use ($data, $request) {
            $olimpiade = Olimpiade::create($data);
            $this->syncDocumentation($olimpiade, $request->validated());

            return $olimpiade;
        });

        $this->logSuccess(
            'create-olimpiade',
            "Created Olimpiade: {$olimpiade->name}",
            [
                'olimpiade_id' => $olimpiade->id,
                'new_data' => $olimpiade->toArray(),
            ],
        );

        return redirect()
            ->route('admin.companies.olimpiades.index')
            ->with('success', 'Olimpiade Created Successfully');
    }

    public function show(Olimpiade $olimpiade): Response
    {
        $this->authorize('view', $olimpiade);

        return Inertia::render('admin/company/olimpiade/show', [
            'olimpiade' => $olimpiade->load(['objectiveItems', 'galleries', 'videoItems']),
        ]);
    }

    public function edit(Olimpiade $olimpiade): Response
    {
        $this->authorize('update', $olimpiade);

        return Inertia::render('admin/company/olimpiade/edit', [
            'olimpiade' => $olimpiade->load(['objectiveItems', 'galleries', 'videoItems']),
            ...$this->formOptions(),
        ]);
    }

    public function update(
        UpdateOlimpiadeRequest $request,
        Olimpiade $olimpiade,
    ) {
        $this->authorize('update', $olimpiade);

        $oldData = $olimpiade->toArray();
        $data = $this->payload($request);

        if ($request->hasFile('featured_image')) {
            $this->deleteFeaturedImage($olimpiade->featured_image);
            $data['featured_image'] = $this->uploadFile(
                null,
                $request->file('featured_image'),
                'uploads/olimpiade',
            );
        }

        DB::transaction(function () use ($olimpiade, $data, $request) {
            $olimpiade->update($data);
            $this->syncDocumentation($olimpiade, $request->validated());
        });

        $this->logSuccess(
            'update-olimpiade',
            "Updated Olimpiade: {$olimpiade->name}",
            [
                'olimpiade_id' => $olimpiade->id,
                'old_data' => $oldData,
                'new_data' => $olimpiade->fresh()->toArray(),
            ],
        );

        return redirect()
            ->route('admin.companies.olimpiades.index')
            ->with('success', 'Olimpiade Updated Successfully');
    }

    public function destroy(Olimpiade $olimpiade)
    {
        $this->authorize('delete', $olimpiade);

        $olimpiadeId = $olimpiade->id;
        $olimpiadeName = $olimpiade->name;

        $this->deleteFeaturedImage($olimpiade->featured_image);
        $olimpiade->delete();

        $this->logSuccess(
            'delete-olimpiade',
            "Deleted Olimpiade: {$olimpiadeName}",
            ['olimpiade_id' => $olimpiadeId],
        );

        return redirect()
            ->route('admin.companies.olimpiades.index')
            ->with('success', 'Olimpiade Deleted Successfully');
    }

    public function status(Olimpiade $olimpiade)
    {
        $this->authorize('update', $olimpiade);

        $olimpiade->update(['status' => ! $olimpiade->status]);

        $this->logSuccess(
            'change-status-olimpiade',
            "Changed Olimpiade status: {$olimpiade->name}",
            [
                'olimpiade_id' => $olimpiade->id,
                'status' => $olimpiade->status,
            ],
        );

        return back()->with('success', 'Olimpiade Status Updated Successfully');
    }

    public function recommended(Olimpiade $olimpiade)
    {
        $this->authorize('update', $olimpiade);

        $olimpiade->update(['recommended' => ! $olimpiade->recommended]);

        $this->logSuccess(
            'change-recommended-olimpiade',
            "Changed Olimpiade recommendation: {$olimpiade->name}",
            [
                'olimpiade_id' => $olimpiade->id,
                'recommended' => $olimpiade->recommended,
            ],
        );

        return back()->with('success', 'Olimpiade Recommendation Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-olimpiade', Olimpiade::class);

        $perPage = $request->integer('perPage') ?: null;
        $page = $request->integer('page') ?: null;
        $globalSearch = $request->string('globalSearch')->toString();
        $filterValue = $request->input('filterValue', []);

        $allowedOrderColumns = [
            'id',
            'name',
            'category',
            'status',
            'recommended',
            'sort_order',
            'created_at',
            'updated_at',
        ];
        $orderBy = in_array($request->input('orderBy'), $allowedOrderColumns, true)
            ? $request->input('orderBy')
            : 'sort_order';
        $orderDirection = strtolower((string) $request->input('orderDirection')) === 'desc'
            ? 'desc'
            : 'asc';

        $query = Olimpiade::query()
            ->search($globalSearch)
            ->when(
                data_get($filterValue, 'category'),
                fn ($query, $category) => $query->where('category', $category),
            )
            ->when(
                data_get($filterValue, 'status') !== null,
                fn ($query) => $query->where(
                    'status',
                    filter_var(data_get($filterValue, 'status'), FILTER_VALIDATE_BOOL),
                ),
            )
            ->when(
                data_get($filterValue, 'recommended') !== null,
                fn ($query) => $query->where(
                    'recommended',
                    filter_var(data_get($filterValue, 'recommended'), FILTER_VALIDATE_BOOL),
                ),
            )
            ->orderBy($orderBy, $orderDirection)
            ->orderBy('id');

        $data = $perPage
            ? $query->paginate($perPage, ['*'], 'page', $page)
            : $query->get();

        return response()->json($data);
    }

    private function deleteFeaturedImage(?string $path): void
    {
        if (! $path || Str::startsWith($path, ['http://', 'https://'])) {
            return;
        }

        $this->deleteFile($path);
    }

    private function payload(
        StoreOlimpiadeRequest|UpdateOlimpiadeRequest $request,
    ): array {
        $data = $request->safe()->except([
            'featured_image',
            'objective_ids',
            'gallery_ids',
            'video_ids',
        ]);

        if ($request->has('status')) {
            $data['status'] = $request->boolean('status');
        }

        if ($request->has('recommended')) {
            $data['recommended'] = $request->boolean('recommended');
        }

        return $data;
    }

    private function formOptions(): array
    {
        return [
            'objectives' => OlimpiadeObjective::query()->ordered()->get(['id', 'title', 'olimpiade_id']),
            'galleries' => OlimpiadeGallery::query()->ordered()->get(['id', 'title', 'image_url', 'olimpiade_id']),
            'videos' => OlimpiadeVideo::query()->ordered()->get(['id', 'title', 'olimpiade_id']),
        ];
    }

    private function syncDocumentation(Olimpiade $olimpiade, array $data): void
    {
        $this->syncItems(OlimpiadeObjective::class, $olimpiade, $data['objective_ids'] ?? []);
        $this->syncItems(OlimpiadeGallery::class, $olimpiade, $data['gallery_ids'] ?? []);
        $this->syncItems(OlimpiadeVideo::class, $olimpiade, $data['video_ids'] ?? []);
    }

    private function syncItems(string $model, Olimpiade $olimpiade, array $ids): void
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));

        $model::query()
            ->where('olimpiade_id', $olimpiade->id)
            ->when($ids, fn ($query) => $query->whereNotIn('id', $ids))
            ->update(['olimpiade_id' => null]);

        if ($ids) {
            $model::query()->whereIn('id', $ids)->update(['olimpiade_id' => $olimpiade->id]);
        }
    }
}
