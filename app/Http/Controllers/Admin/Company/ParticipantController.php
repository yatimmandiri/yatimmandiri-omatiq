<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateParticipantRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantController extends Controller
{
    use LogActivity, UploadFiles;

    public function index(): Response
    {
        $this->authorize('viewAny', Participant::class);

        return Inertia::render('admin/company/participant/list');
    }

    public function show(Participant $participant): Response
    {
        $this->authorize('view', $participant);

        return Inertia::render('admin/company/participant/show', [
            'participant' => $this->participantPayload($participant->load(['olimpiade:id,name', 'province:id,name', 'regency:id,name,province_id'])),
        ]);
    }

    public function edit(Participant $participant): Response
    {
        $this->authorize('update', $participant);

        return Inertia::render('admin/company/participant/edit', [
            'participant' => $this->participantPayload($participant),
            ...$this->formOptions(),
        ]);
    }

    public function update(UpdateParticipantRequest $request, Participant $participant)
    {
        $this->authorize('update', $participant);

        $data = $this->payload($request);

        foreach ($this->fileMap() as $input => $column) {
            if ($request->hasFile($input)) {
                $data[$column] = $this->replaceFile(
                    $participant->{$column},
                    $request->file($input),
                    'uploads/participants/'.$input,
                );
            }
        }

        $participant->update($data);

        $this->logSuccess('update-participant', "Updated participant: {$participant->full_name}", [
            'participant_id' => $participant->id,
        ]);

        return redirect()
            ->route('admin.companies.participants.index')
            ->with('success', 'Participant Updated Successfully');
    }

    public function destroy(Participant $participant)
    {
        $this->authorize('delete', $participant);

        foreach ($this->fileMap() as $column) {
            $this->deleteFile($participant->{$column});
        }

        $name = $participant->full_name;
        $participant->delete();

        $this->logSuccess('delete-participant', "Deleted participant: {$name}");

        return redirect()
            ->route('admin.companies.participants.index')
            ->with('success', 'Participant Deleted Successfully');
    }

    public function status(Request $request, Participant $participant)
    {
        $this->authorize('update', $participant);

        $request->validate([
            'status' => ['required', 'in:submitted,verified,rejected'],
            'notes' => ['nullable', 'string'],
        ]);

        $participant->update($request->only(['status', 'notes']));

        return back()->with('success', 'Participant Status Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $allowed = ['id', 'registration_number', 'full_name', 'education_level', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true)
            ? $request->input('orderBy')
            : 'created_at';
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';

        $query = Participant::query()
            ->with(['olimpiade:id,name', 'province:id,name', 'regency:id,name'])
            ->search($request->string('globalSearch')->toString())
            ->when($request->input('filterValue.status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->input('filterValue.olimpiade_id'), fn ($query, $id) => $query->where('olimpiade_id', $id))
            ->orderBy($orderBy, $direction)
            ->orderBy('id', 'desc');

        $data = $request->integer('perPage')
            ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null)
            : $query->get();

        return response()->json($data);
    }

    private function payload(UpdateParticipantRequest $request): array
    {
        $data = $request->safe()->except([
            'photo',
            'identity_card',
            'recommendation_letter',
            'achievement_certificate',
        ]);

        $data['has_joined_before'] = $request->boolean('has_joined_before');
        $data['data_truth_consent'] = $request->boolean('data_truth_consent');
        $data['documentation_consent'] = $request->boolean('documentation_consent');
        $data['rules_consent'] = $request->boolean('rules_consent');

        if (! $data['has_joined_before']) {
            $data['previous_year'] = null;
        }

        return $data;
    }

    private function formOptions(): array
    {
        return [
            'olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name', 'category', 'slug']),
            'provinces' => Province::query()->orderBy('name')->get(['id', 'name']),
            'regencies' => Regency::query()
                ->orderBy('name')
                ->get(['id', 'province_id', 'name'])
                ->map(fn (Regency $regency) => [
                    'id' => $regency->id,
                    'province_id' => $regency->province_id,
                    'name' => $regency->name,
                ]),
        ];
    }

    private function participantPayload(Participant $participant): array
    {
        return [
            ...$participant->toArray(),
            'photo_url' => $participant->photo_url,
            'identity_card_url' => $participant->identity_card_url,
            'recommendation_letter_url' => $participant->recommendation_letter_url,
            'achievement_certificate_url' => $participant->achievement_certificate_url,
        ];
    }

    private function fileMap(): array
    {
        return [
            'photo' => 'photo_path',
            'identity_card' => 'identity_card_path',
            'recommendation_letter' => 'recommendation_letter_path',
            'achievement_certificate' => 'achievement_certificate_path',
        ];
    }
}
