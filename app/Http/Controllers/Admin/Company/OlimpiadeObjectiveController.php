<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreOlimpiadeObjectiveRequest;
use App\Http\Requests\Company\UpdateOlimpiadeObjectiveRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\OlimpiadeObjective;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OlimpiadeObjectiveController extends Controller
{
    use LogActivity;

    public function index(): Response
    {
        $this->authorize('viewAny', OlimpiadeObjective::class);

        return Inertia::render('admin/company/olimpiade-objective/list');
    }

    public function create(): Response
    {
        $this->authorize('create', OlimpiadeObjective::class);

        return Inertia::render('admin/company/olimpiade-objective/create', $this->formOptions());
    }

    public function store(StoreOlimpiadeObjectiveRequest $request)
    {
        $this->authorize('create', OlimpiadeObjective::class);
        $objective = OlimpiadeObjective::create($this->payload($request));
        $this->logSuccess('create-olimpiade-objective', "Created objective: {$objective->title}", ['objective_id' => $objective->id]);

        return redirect()->route('admin.companies.olimpiade-objectives.index')->with('success', 'Objective Created Successfully');
    }

    public function show(OlimpiadeObjective $olimpiadeObjective): Response
    {
        $this->authorize('view', $olimpiadeObjective);

        return Inertia::render('admin/company/olimpiade-objective/show', ['item' => $olimpiadeObjective->load('olimpiade')]);
    }

    public function edit(OlimpiadeObjective $olimpiadeObjective): Response
    {
        $this->authorize('update', $olimpiadeObjective);

        return Inertia::render('admin/company/olimpiade-objective/edit', ['item' => $olimpiadeObjective, ...$this->formOptions()]);
    }

    public function update(UpdateOlimpiadeObjectiveRequest $request, OlimpiadeObjective $olimpiadeObjective)
    {
        $this->authorize('update', $olimpiadeObjective);
        $olimpiadeObjective->update($this->payload($request));
        $this->logSuccess('update-olimpiade-objective', "Updated objective: {$olimpiadeObjective->title}", ['objective_id' => $olimpiadeObjective->id]);

        return redirect()->route('admin.companies.olimpiade-objectives.index')->with('success', 'Objective Updated Successfully');
    }

    public function destroy(OlimpiadeObjective $olimpiadeObjective)
    {
        $this->authorize('delete', $olimpiadeObjective);
        $title = $olimpiadeObjective->title;
        $olimpiadeObjective->delete();
        $this->logSuccess('delete-olimpiade-objective', "Deleted objective: {$title}");

        return redirect()->route('admin.companies.olimpiade-objectives.index')->with('success', 'Objective Deleted Successfully');
    }

    public function status(OlimpiadeObjective $olimpiadeObjective)
    {
        $this->authorize('update', $olimpiadeObjective);
        $olimpiadeObjective->update(['status' => ! $olimpiadeObjective->status]);

        return back()->with('success', 'Objective Status Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-olimpiade-objective', OlimpiadeObjective::class);

        return response()->json($this->query($request));
    }

    private function query(Request $request)
    {
        $allowed = ['id', 'title', 'sort_order', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'sort_order';
        $direction = strtolower((string) $request->input('orderDirection')) === 'desc' ? 'desc' : 'asc';
        $query = OlimpiadeObjective::query()->with('olimpiade:id,name')->search($request->string('globalSearch')->toString())->orderBy($orderBy, $direction)->orderBy('id');

        return $request->integer('perPage') ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null) : $query->get();
    }

    private function payload(StoreOlimpiadeObjectiveRequest|UpdateOlimpiadeObjectiveRequest $request): array
    {
        $data = $request->validated();
        $data['status'] = $request->has('status') ? $request->boolean('status') : true;

        return $data;
    }

    private function formOptions(): array
    {
        return ['olimpiades' => Olimpiade::query()->ordered()->get(['id', 'name'])];
    }
}
