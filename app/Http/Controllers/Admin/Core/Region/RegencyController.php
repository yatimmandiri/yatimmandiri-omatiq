<?php

namespace App\Http\Controllers\Admin\Core\Region;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Core\StoreRegencyRequest;
use App\Http\Requests\Core\UpdateRegencyRequest;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegencyController extends Controller
{
    use LogActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Regency::class);

        $provinces = Province::query()->select(['id', 'name'])->get();

        $data = [
            'provinces' => $provinces
        ];

        return Inertia::render('admin/core/regions/regencies/list', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Regency::class);

        $provinces = Province::query()->select(['id', 'name'])->get();

        $data = [
            'provinces' => $provinces
        ];

        return Inertia::render('admin/core/regions/regencies/create', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRegencyRequest $request)
    {
        $this->authorize('create', Regency::class);

        $data = [
            'id' => Regency::where('province_id', $request->province_id)->max('id') + 1,
            'name' => $request->name,
            'province_id' => $request->province_id,
        ];

        $regency = Regency::create($data);

        if ($regency) {
            $this->logSuccess('create-regency', "Created Regency: {$regency->name}", [
                'regency_id' => $regency->id,
                'new_data' => $regency->toArray(),
            ]);
        } else {
            $this->logError('create-regency', "Failed To Create Regency: {$regency->name}", [
                'regency_id' => $regency->id,
                'new_data' => $regency->toArray(),
            ]);
        }

        return redirect()->route('admin.core.regions.regencies.index')->with('success', 'Regency Created Successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Regency $regency)
    {
        $this->authorize('view', $regency);

        $regency->load(['province']);

        $data = [
            'regency' => $regency
        ];

        return Inertia::render('admin/core/regions/regencies/show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Regency $regency)
    {
        $this->authorize('update', $regency);

        $regency->load(['province']);

        $provinces = Province::query()->select(['id', 'name'])->get();

        $data = [
            'regency' => $regency,
            'provinces' => $provinces
        ];

        return Inertia::render('admin/core/regions/regencies/edit', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRegencyRequest $request, Regency $regency)
    {
        $this->authorize('update', $regency);

        $data = [
            'name' => $request->name,
            'province_id' => $request->province_id,
        ];

        $oldData = $regency->replicate();
        $regency->update($data);

        if ($regency) {
            $this->logSuccess('update-regency', "Update Regency: {$regency->name}", [
                'regency_id' => $regency->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $regency->toArray(),
            ]);
        } else {
            $this->logError('update-regency', "Failed To Update Regency: {$regency->name}", [
                'regency_id' => $regency->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $regency->toArray(),
            ]);
        }

        return redirect()->route('admin.core.regions.regencies.index')->with('success', 'Regency Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Regency $regency)
    {
        $this->authorize('delete', $regency);

        $regency->delete();

        if ($regency) {
            $this->logSuccess('delete-regency', "Delete Regency: {$regency->name}", ['regency_id' => $regency->id]);
        } else {
            $this->logError('delete-regency', "Failed To Delete Regency: {$regency->name}", ['regency_id' => $regency->id]);
        }

        return redirect()->route('admin.core.regions.regencies.index')->with('success', 'Regency Deleted Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-regency', Regency::class);

        $perPage = $request->input('perPage', null);
        $page = $request->input('page', null);
        $globalSearch = $request->input('globalSearch', '');
        $orderDirection = $request->input('orderDirection', 'desc');
        $orderBy = $request->input('orderBy', 'id');
        $filterValue = $request->input('filterValue', []);

        $query = Regency::query()
            ->with(['province'])
            ->withCount('districts')
            ->latest()
            ->search($globalSearch)
            ->when(
                data_get($filterValue, 'province_id'),
                fn($query, $value) =>
                $query->where('province_id', $value)
            )
            ->orderBy($orderBy, $orderDirection);

        $data = $perPage
            ? $query->paginate($perPage, ['*'], 'page', $page)
            : $query->get();

        return response()->json($data);
    }
}
