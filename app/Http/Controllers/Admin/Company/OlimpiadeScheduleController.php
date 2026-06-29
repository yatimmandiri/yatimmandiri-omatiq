<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreOlimpiadeScheduleRequest;
use App\Http\Requests\Company\UpdateOlimpiadeScheduleRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\OlimpiadeSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OlimpiadeScheduleController extends Controller
{
    use LogActivity;

    public function index(): Response
    {
        $this->authorize('viewAny', OlimpiadeSchedule::class);

        return Inertia::render('admin/company/olimpiade-schedule/list');
    }

    public function create(): Response
    {
        $this->authorize('create', OlimpiadeSchedule::class);

        return Inertia::render('admin/company/olimpiade-schedule/create', $this->formOptions());
    }

    public function store(StoreOlimpiadeScheduleRequest $request)
    {
        $this->authorize('create', OlimpiadeSchedule::class);

        $schedule = OlimpiadeSchedule::create($this->payload($request));

        $this->logSuccess('create-olimpiade-schedule', "Created schedule: {$schedule->title}", [
            'olimpiade_schedule_id' => $schedule->id,
        ]);

        return redirect()
            ->route('admin.companies.olimpiade-schedules.index')
            ->with('success', 'Jadwal Olimpiade Created Successfully');
    }

    public function show(OlimpiadeSchedule $olimpiadeSchedule): Response
    {
        $this->authorize('view', $olimpiadeSchedule);

        return Inertia::render('admin/company/olimpiade-schedule/show', [
            'schedule' => $olimpiadeSchedule->load('olimpiade:id,name,slug'),
        ]);
    }

    public function edit(OlimpiadeSchedule $olimpiadeSchedule): Response
    {
        $this->authorize('update', $olimpiadeSchedule);

        return Inertia::render('admin/company/olimpiade-schedule/edit', [
            'schedule' => $olimpiadeSchedule,
            ...$this->formOptions(),
        ]);
    }

    public function update(UpdateOlimpiadeScheduleRequest $request, OlimpiadeSchedule $olimpiadeSchedule)
    {
        $this->authorize('update', $olimpiadeSchedule);

        $olimpiadeSchedule->update($this->payload($request));

        $this->logSuccess('update-olimpiade-schedule', "Updated schedule: {$olimpiadeSchedule->title}", [
            'olimpiade_schedule_id' => $olimpiadeSchedule->id,
        ]);

        return redirect()
            ->route('admin.companies.olimpiade-schedules.index')
            ->with('success', 'Jadwal Olimpiade Updated Successfully');
    }

    public function destroy(OlimpiadeSchedule $olimpiadeSchedule)
    {
        $this->authorize('delete', $olimpiadeSchedule);

        $title = $olimpiadeSchedule->title;
        $olimpiadeSchedule->delete();

        $this->logSuccess('delete-olimpiade-schedule', "Deleted schedule: {$title}");

        return redirect()
            ->route('admin.companies.olimpiade-schedules.index')
            ->with('success', 'Jadwal Olimpiade Deleted Successfully');
    }

    public function status(OlimpiadeSchedule $olimpiadeSchedule)
    {
        $this->authorize('update', $olimpiadeSchedule);

        $olimpiadeSchedule->update(['status' => ! $olimpiadeSchedule->status]);

        return back()->with('success', 'Jadwal Olimpiade Status Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-olimpiade-schedule', OlimpiadeSchedule::class);

        $allowed = ['id', 'title', 'phase', 'start_date', 'end_date', 'status', 'sort_order', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true)
            ? $request->input('orderBy')
            : 'start_date';
        $direction = strtolower((string) $request->input('orderDirection')) === 'desc' ? 'desc' : 'asc';

        $query = OlimpiadeSchedule::query()
            ->with('olimpiade:id,name,slug')
            ->search($request->string('globalSearch')->toString())
            ->when($request->input('filterValue.olimpiade_id'), fn ($query, $id) => $query->where('olimpiade_id', $id))
            ->orderBy($orderBy, $direction)
            ->orderBy('sort_order')
            ->orderBy('id');

        $data = $request->integer('perPage')
            ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null)
            : $query->get();

        return response()->json($data);
    }

    private function payload(StoreOlimpiadeScheduleRequest|UpdateOlimpiadeScheduleRequest $request): array
    {
        $data = $request->validated();
        $data['status'] = $request->has('status') ? $request->boolean('status') : true;
        $data['sort_order'] = $data['sort_order'] ?? 0;

        return $data;
    }

    private function formOptions(): array
    {
        return [
            'olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'slug']),
        ];
    }
}
