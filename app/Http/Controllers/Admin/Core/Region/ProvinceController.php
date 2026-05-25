<?php

namespace App\Http\Controllers\Admin\Core\Region;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Core\StoreProvinceRequest;
use App\Http\Requests\Core\UpdateProvinceRequest;
use App\Models\Core\Region\Province;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProvinceController extends Controller
{
    use LogActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Province::class);

        $data = [];

        return Inertia::render('admin/core/regions/provinces/list', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Province::class);

        $data = [];

        return Inertia::render('admin/core/regions/provinces/create', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProvinceRequest $request)
    {
        $this->authorize('create', Province::class);

        $data = [
            'id' => Province::max('id') + 1,
            'name' => $request->name,
        ];

        $province = Province::create($data);

        if ($province) {
            $this->logSuccess('create-province', "Created Province: {$province->name}", [
                'province_id' => $province->id,
                'new_data' => $province->toArray(),
            ]);
        } else {
            $this->logError('create-province', "Failed To Create Province: {$province->name}", [
                'province_id' => $province->id,
                'new_data' => $province->toArray(),
            ]);
        }

        return redirect()->route('admin.core.regions.provinces.index')->with('success', 'Province Created Successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Province $province)
    {
        $this->authorize('view', $province);

        $data = [
            'province' => $province
        ];

        return Inertia::render('admin/core/regions/provinces/show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Province $province)
    {
        $this->authorize('update', $province);

        $data = [
            'province' => $province
        ];

        return Inertia::render('admin/core/regions/provinces/edit', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProvinceRequest $request, Province $province)
    {
        $this->authorize('update', $province);

        $data = [
            'name' => $request->name,
        ];

        $oldData = $province->replicate();
        $province->update($data);

        if ($province) {
            $this->logSuccess('update-province', "Update Province: {$province->name}", [
                'province_id' => $province->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $province->toArray(),
            ]);
        } else {
            $this->logError('update-province', "Failed To Update Province: {$province->name}", [
                'province_id' => $province->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $province->toArray(),
            ]);
        }

        return redirect()->route('admin.core.regions.provinces.index')->with('success', 'Permission Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Province $province)
    {
        $this->authorize('delete', $province);

        $province->delete();

        if ($province) {
            $this->logSuccess('delete-province', "Delete Province: {$province->name}", ['province_id' => $province->id]);
        } else {
            $this->logError('delete-province', "Failed To Delete Province: {$province->name}", ['province_id' => $province->id]);
        }

        return redirect()->route('admin.core.regions.provinces.index')->with('success', 'Province Deleted Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-province', Province::class);

        $perPage = $request->input('perPage', null);
        $page = $request->input('page', null);
        $globalSearch = $request->input('globalSearch', '');
        $orderDirection = $request->input('orderDirection', 'desc');
        $orderBy = $request->input('orderBy', 'id');

        $query = Province::query()
            ->withCount('regencies')
            ->latest()
            ->search($globalSearch)
            ->orderBy($orderBy, $orderDirection);

        $data = $perPage
            ? $query->paginate($perPage, ['*'], 'page', $page)
            : $query->get();

        return response()->json($data);
    }
}
