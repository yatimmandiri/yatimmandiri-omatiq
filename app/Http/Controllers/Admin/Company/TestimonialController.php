<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreTestimonialRequest;
use App\Http\Requests\Company\UpdateTestimonialRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    use LogActivity, UploadFiles;

    public function index(): Response
    {
        $this->authorize('viewAny', Testimonial::class);

        return Inertia::render('admin/company/testimonial/list');
    }

    public function create(): Response
    {
        $this->authorize('create', Testimonial::class);

        $data = [
            'olimpiades' => Olimpiade::where('status', true)->get(),
        ];

        return Inertia::render('admin/company/testimonial/create', $data);
    }

    public function store(StoreTestimonialRequest $request)
    {
        $this->authorize('create', Testimonial::class);

        $testimonial = Testimonial::create($this->payload($request));

        $this->logSuccess('create-testimonial', "Created testimonial: {$testimonial->name}", [
            'testimonial_id' => $testimonial->id,
            'new_data' => $testimonial->toArray(),
        ]);

        return redirect()->route('admin.companies.testimonials.index')->with('success', 'Testimonial Created Successfully');
    }

    public function show(Testimonial $testimonial): Response
    {
        $this->authorize('view', $testimonial);

        return Inertia::render('admin/company/testimonial/show', ['testimonial' => $testimonial]);
    }

    public function edit(Testimonial $testimonial): Response
    {
        $this->authorize('update', $testimonial);

        $data = [
            'testimonial' => $testimonial,
            'olimpiades' => Olimpiade::where('status', true)->get(),
        ];

        return Inertia::render('admin/company/testimonial/edit', $data);
    }

    public function update(UpdateTestimonialRequest $request, Testimonial $testimonial)
    {
        $this->authorize('update', $testimonial);

        $oldData = $testimonial->toArray();
        $testimonial->update($this->payload($request, $testimonial));

        $this->logSuccess('update-testimonial', "Updated testimonial: {$testimonial->name}", [
            'testimonial_id' => $testimonial->id,
            'old_data' => $oldData,
            'new_data' => $testimonial->fresh()->toArray(),
        ]);

        return redirect()->route('admin.companies.testimonials.index')->with('success', 'Testimonial Updated Successfully');
    }

    public function destroy(Testimonial $testimonial)
    {
        $this->authorize('delete', $testimonial);

        if ($testimonial->avatar && ! Str::startsWith($testimonial->avatar, ['http://', 'https://'])) {
            $this->deleteFile($testimonial->avatar);
        }

        $name = $testimonial->name;
        $testimonial->delete();
        $this->logSuccess('delete-testimonial', "Deleted testimonial: {$name}");

        return redirect()->route('admin.companies.testimonials.index')->with('success', 'Testimonial Deleted Successfully');
    }

    public function status(Testimonial $testimonial)
    {
        $this->authorize('update', $testimonial);
        $testimonial->update(['status' => ! $testimonial->status]);

        return back()->with('success', 'Testimonial Status Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-testimonial', Testimonial::class);

        $allowed = ['id', 'type', 'name', 'role', 'rating', 'sort_order', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'sort_order';
        $direction = strtolower((string) $request->input('orderDirection')) === 'desc' ? 'desc' : 'asc';
        $filterValue = $request->input('filterValue', []);

        $query = Testimonial::query()
            ->search($request->string('globalSearch')->toString())
            ->type(data_get($filterValue, 'type'))
            ->when(
                data_get($filterValue, 'status') !== null,
                fn ($query) => $query->where('status', filter_var(data_get($filterValue, 'status'), FILTER_VALIDATE_BOOL)),
            )
            ->orderBy($orderBy, $direction)
            ->orderBy('id');

        $data = $request->integer('perPage')
            ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null)
            : $query->get();

        return response()->json($data);
    }

    private function payload(StoreTestimonialRequest|UpdateTestimonialRequest $request, ?Testimonial $testimonial = null): array
    {
        $data = $request->safe()->except(['avatar_file']);

        if ($request->hasFile('avatar_file')) {
            $oldPath = $testimonial?->avatar;
            $data['avatar'] = $this->uploadFile(
                $oldPath && ! Str::startsWith($oldPath, ['http://', 'https://']) ? $oldPath : null,
                $request->file('avatar_file'),
                'uploads/testimonials',
            );
        }

        $data['status'] = $request->has('status') ? $request->boolean('status') : true;

        return $data;
    }
}
