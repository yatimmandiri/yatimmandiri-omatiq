<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StorePeriodRequest;
use App\Http\Requests\Company\UpdatePeriodRequest;
use App\Models\Company\Period;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeriodController extends Controller
{
    use LogActivity;

    public function index(): Response
    {
        $this->authorize('viewAny', Period::class);

        return Inertia::render('admin/company/periods/list');
    }

    public function create(): Response
    {
        $this->authorize('create', Period::class);

        return Inertia::render('admin/company/periods/create');
    }

    public function store(StorePeriodRequest $request)
    {
        $this->authorize('create', Period::class);

        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');

        if ($data['is_active']) {
            Period::query()->update(['is_active' => false]);
        }

        $period = Period::create($data);

        $this->logSuccess('create-period', "Created period: {$period->name} ({$period->year})", [
            'period_id' => $period->id,
        ]);

        return redirect()
            ->route('admin.companies.periods.index')
            ->with('success', 'Periode berhasil ditambahkan.');
    }

    public function show(Period $period): Response
    {
        $this->authorize('view', $period);

        $period->loadCount(['olimpiades', 'participants']);

        return Inertia::render('admin/company/periods/show', [
            'period' => $period,
        ]);
    }

    public function edit(Period $period): Response
    {
        $this->authorize('update', $period);

        return Inertia::render('admin/company/periods/edit', [
            'period' => $period,
        ]);
    }

    public function update(UpdatePeriodRequest $request, Period $period)
    {
        $this->authorize('update', $period);

        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');

        if ($data['is_active']) {
            Period::where('id', '!=', $period->id)->update(['is_active' => false]);
        }

        $period->update($data);

        $this->logSuccess('update-period', "Updated period: {$period->name} ({$period->year})", [
            'period_id' => $period->id,
        ]);

        return redirect()
            ->route('admin.companies.periods.index')
            ->with('success', 'Periode berhasil diperbarui.');
    }

    public function destroy(Period $period)
    {
        $this->authorize('delete', $period);

        if ($period->olimpiades()->exists() || $period->participants()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus periode yang memiliki data olimpiade atau peserta terkait.');
        }

        $name = $period->name;
        $year = $period->year;
        $period->delete();

        $this->logSuccess('delete-period', "Deleted period: {$name} ({$year})");

        return redirect()
            ->route('admin.companies.periods.index')
            ->with('success', 'Periode berhasil dihapus.');
    }

    public function status(Period $period)
    {
        $this->authorize('update', $period);

        $newStatus = ! $period->is_active;

        if ($newStatus) {
            Period::where('id', '!=', $period->id)->update(['is_active' => false]);
        }

        $period->update(['is_active' => $newStatus]);

        $this->logSuccess('update-period-status', "Toggled period activation: {$period->name} ({$period->year}) -> ".($newStatus ? 'Active' : 'Inactive'));

        return back()->with('success', 'Status aktivasi periode berhasil diperbarui.');
    }

    public function getData(Request $request)
    {
        $this->authorize('dataPeriod', Period::class);

        $allowed = ['id', 'name', 'year', 'is_active', 'start_date', 'end_date', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true)
            ? $request->input('orderBy')
            : 'year';
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';

        $query = Period::query()
            ->withCount(['olimpiades', 'participants'])
            ->search($request->string('globalSearch')->toString())
            ->when($request->filled('filterValue.is_active'), fn ($q) => $q->where('is_active', filter_var($request->input('filterValue.is_active'), FILTER_VALIDATE_BOOLEAN)))
            ->orderBy($orderBy, $direction)
            ->orderBy('id', 'desc');

        $data = $request->integer('perPage')
            ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null)
            : $query->get();

        return response()->json($data);
    }
}
