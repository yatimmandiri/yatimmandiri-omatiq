<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Company\StoreReviewRequest;
use App\Http\Requests\Admin\Company\UpdateReviewRequest;
use App\Http\Requests\Company\StoreReviewRequest as CompanyStoreReviewRequest;
use App\Http\Requests\Company\UpdateReviewRequest as CompanyUpdateReviewRequest;
use App\Models\Company\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    use LogActivity, UploadFiles;

    public function index(): Response
    {
        $this->authorize('viewAny', Review::class);

        $data = [
            'reviews' => Review::get()
        ];

        return Inertia::render('admin/company/review/list', $data);
    }

    public function create(): Response
    {
        $this->authorize('create', Review::class);

        return Inertia::render('admin/company/review/create');
    }

    public function store(CompanyStoreReviewRequest $request)
    {
        $this->authorize('create', Review::class);

        $review = Review::create($this->payload($request));

        $this->logSuccess('create-review', "Created review: {$review->name}", [
            'review_id' => $review->id,
            'new_data' => $review->toArray(),
        ]);

        return redirect()->route('admin.companies.reviews.index')->with('success', 'Review Created Successfully');
    }

    public function show(Review $review): Response
    {
        $this->authorize('view', $review);

        return Inertia::render('admin/company/review/show', ['review' => $review]);
    }

    public function edit(Review $review): Response
    {
        $this->authorize('update', $review);

        return Inertia::render('admin/company/review/edit', ['review' => $review]);
    }

    public function update(CompanyUpdateReviewRequest $request, Review $review)
    {
        $this->authorize('update', $review);

        $oldData = $review->toArray();
        $review->update($this->payload($request, $review));

        $this->logSuccess('update-review', "Updated review: {$review->name}", [
            'review_id' => $review->id,
            'old_data' => $oldData,
            'new_data' => $review->fresh()->toArray(),
        ]);

        return redirect()->route('admin.companies.reviews.index')->with('success', 'Review Updated Successfully');
    }

    public function destroy(Review $review)
    {
        $this->authorize('delete', $review);

        if ($review->avatar && ! Str::startsWith($review->avatar, ['http://', 'https://'])) {
            $this->deleteFile($review->avatar);
        }

        $name = $review->name;
        $review->delete();
        $this->logSuccess('delete-review', "Deleted review: {$name}");

        return redirect()->route('admin.companies.reviews.index')->with('success', 'Review Deleted Successfully');
    }

    public function status(Review $review)
    {
        $this->authorize('update', $review);
        $review->update(['status' => ! $review->status]);

        return back()->with('success', 'Review Status Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-review', Review::class);

        $allowed = ['id', 'type', 'name', 'role', 'rating', 'sort_order', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'sort_order';
        $direction = strtolower((string) $request->input('orderDirection')) === 'desc' ? 'desc' : 'asc';
        $filterValue = $request->input('filterValue', []);

        $query = Review::query()
            ->search($request->string('globalSearch')->toString())
            ->type(data_get($filterValue, 'type'))
            ->when(
                data_get($filterValue, 'status') !== null,
                fn($query) => $query->where('status', filter_var(data_get($filterValue, 'status'), FILTER_VALIDATE_BOOL)),
            )
            ->orderBy($orderBy, $direction)
            ->orderBy('id');

        $data = $request->integer('perPage')
            ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null)
            : $query->get();

        return response()->json($data);
    }

    private function payload(CompanyStoreReviewRequest|CompanyUpdateReviewRequest $request, ?Review $review = null): array
    {
        $data = $request->safe()->except(['avatar_file', 'avatar_url']);

        if ($request->hasFile('avatar_file')) {
            $oldPath = $review?->avatar;
            $data['avatar'] = $this->uploadFile(
                $oldPath && ! Str::startsWith($oldPath, ['http://', 'https://']) ? $oldPath : null,
                $request->file('avatar_file'),
                'uploads/reviews',
            );
        } elseif ($request->filled('avatar_url')) {
            if ($review?->avatar && ! Str::startsWith($review->avatar, ['http://', 'https://'])) {
                $this->deleteFile($review->avatar);
            }
            $data['avatar'] = $request->string('avatar_url')->toString();
        }

        $data['status'] = $request->has('status') ? $request->boolean('status') : true;

        return $data;
    }
}
