<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateParticipantRequest;
use App\Models\Company\Olimpiade;
use App\Models\Company\Participant;
use App\Models\Company\Period;
use App\Models\Core\Region\Province;
use App\Models\Core\Region\Regency;
use App\Settings\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantController extends Controller
{
    use LogActivity, UploadFiles;

    public function index(): Response
    {
        $this->authorize('viewAny', Participant::class);

        $periods = Period::ordered()->get(['id', 'name', 'year', 'is_active']);

        $eventYearsOptions = $periods->isNotEmpty()
            ? $periods->map(fn (Period $p) => [
                'value' => (string) $p->year,
                'label' => "{$p->name} ({$p->year})".($p->is_active ? ' • Aktif' : ''),
            ])
            : collect([
                ...Participant::query()->whereNotNull('event_year')->distinct()->pluck('event_year')->all(),
                ...Olimpiade::query()->whereNotNull('event_year')->distinct()->pluck('event_year')->all(),
            ])->filter()->unique()->sortDesc()->values()->map(fn ($year) => [
                'value' => (string) $year,
                'label' => (string) $year,
            ]);

        $settings = app(SiteSettings::class);

        $user = Auth::user();
        $isCabang = $user && $user->hasRole('Cabang');
        $userBranch = $isCabang ? $user->getBranchName() : null;

        $branchesQuery = Participant::query()
            ->whereNotNull('branch')
            ->where('branch', '<>', '')
            ->distinct();

        if ($isCabang && $userBranch) {
            $branchesQuery->where(function ($q) use ($userBranch) {
                $q->where('branch', $userBranch)
                    ->orWhere('branch', 'like', "%{$userBranch}%");
            });
        }

        return Inertia::render('admin/company/participant/list', [
            'userBranch' => $userBranch,
            'sheets' => [
                'enabled' => $settings->sheets_sync_enabled,
                'spreadsheet_id' => $settings->sheets_spreadsheet_id,
                'sheet_name' => $settings->sheets_sheet_name ?? config('sheets.sheet_name'),
                'url' => $settings->sheets_spreadsheet_id ? 'https://docs.google.com/spreadsheets/d/'.$settings->sheets_spreadsheet_id : null,
            ],
            'filterOptions' => [
                'olimpiades' => Olimpiade::query()
                    ->ordered()
                    ->get(['id', 'name', 'event_year'])
                    ->map(fn (Olimpiade $olimpiade) => [
                        'value' => (string) $olimpiade->id,
                        'label' => trim($olimpiade->name.' '.($olimpiade->event_year ? "({$olimpiade->event_year})" : '')),
                    ]),
                'eventYears' => $eventYearsOptions,
                'branches' => $branchesQuery
                    ->orderBy('branch')
                    ->limit(150)
                    ->pluck('branch')
                    ->map(fn (string $branch) => [
                        'value' => $branch,
                        'label' => $branch,
                    ]),
            ],
        ]);
    }

    public function show(Participant $participant): Response
    {
        $this->authorize('view', $participant);

        return Inertia::render('admin/company/participant/show', [
            'participant' => $this->participantPayload($participant),
        ]);
    }

    public function edit(Participant $participant): Response
    {
        $this->authorize('update', $participant);

        $data = $this->participantPayload($participant);

        return Inertia::render('admin/company/participant/edit', [
            'participant' => $data,
            'olimpiades' => Olimpiade::active()->ordered()->get(['id', 'name']),
            'provinces' => Province::all(['id', 'name']),
            'regencies' => $participant->student?->province_id
                ? Regency::where('province_id', $participant->student->province_id)->get(['id', 'name'])
                : [],
        ]);
    }

    public function update(UpdateParticipantRequest $request, Participant $participant)
    {
        $this->authorize('update', $participant);

        $payload = $this->payload($request);
        $name = $participant->student?->full_name ?? $participant->user?->name ?? 'Unknown';

        DB::transaction(function () use ($request, $participant, $payload) {
            $studentData = $request->safe()->only([
                'full_name',
                'nickname',
                'gender',
                'birth_place',
                'birth_date',
                'school_name',
                'grade',
                'address',
                'province_id',
                'regency_id',
                'parent_phone',
                'nik',
            ]);

            if ($participant->student) {
                if ($participant->student->penyaluran_id) {
                    $this->studentService->syncToPenyaluran($participant->student, $studentData);
                }
                $participant->student->update($studentData);
            }

            if ($request->hasFile('payment_proof')) {
                if ($participant->payment_proof_path) {
                    $this->deleteFile($participant->payment_proof_path);
                }

                $payload['payment_proof_path'] = $this->uploadFile(
                    $request->file('payment_proof'),
                    'participants/payment_proofs'
                );
            }

            $participant->update($payload);
        });

        $this->logSuccess('update-participant', "Updated participant: {$name}", [
            'participant_id' => $participant->id,
            'new_data' => $payload,
        ]);

        return redirect()
            ->route('admin.companies.participants.index')
            ->with('success', 'Participant Updated Successfully');
    }

    public function destroy(Participant $participant)
    {
        $this->authorize('delete', $participant);

        $name = $participant->student?->full_name ?? $participant->user?->name ?? 'Unknown';

        DB::transaction(function () use ($participant) {
            if ($participant->payment_proof_path) {
                $this->deleteFile($participant->payment_proof_path);
            }

            $participant->delete();
        });

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

    public function syncSheet(Request $request)
    {
        $this->authorize('syncSheet', Participant::class);

        $settings = app(SiteSettings::class);
        if (! $settings->sheets_sync_enabled || ! $settings->sheets_spreadsheet_id) {
            return back()->with('error', 'GSheet sync belum diaktifkan. Atur spreadsheet ID di Site Settings.');
        }

        Artisan::queue('sheets:sync', ['--chunk' => 200]);

        return back()->with('success', 'Sync ke Google Sheets dimulai. Cek GSheet dalam beberapa menit (queue).');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-participant', Participant::class);

        $user = Auth::user();
        $allowed = ['id', 'registration_number', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true)
            ? $request->input('orderBy')
            : 'created_at';
        $direction = strtolower((string) $request->input('orderDirection')) === 'asc' ? 'asc' : 'desc';

        $filterValue = $request->input('filterValue', []);
        if (is_string($filterValue)) {
            $filterValue = json_decode($filterValue, true) ?? [];
        }

        $query = Participant::query()
            ->with([
                'olimpiade:id,name',
                'student:id,full_name,school_name,gender,province_id,regency_id',
                'student.regency:id,name',
            ])
            ->search($request->string('globalSearch')->toString());

        // Cabang role strict scoping
        if ($user && $user->hasRole('Cabang')) {
            $branch = $user->getBranchName();
            if (filled($branch)) {
                $query->where(function ($q) use ($branch) {
                    $q->where('branch', $branch)
                        ->orWhere('branch', 'like', "%{$branch}%");
                });
            }
        } elseif ($user && $user->hasRole('Teacher')) {
            $query->where(function ($q) use ($user) {
                $q->where('mentor_id', $user->id)
                    ->orWhereHas('student', fn ($sq) => $sq->where('mentor_id', $user->id));
            });
        }

        $status = data_get($filterValue, 'status');
        $olimpiadeId = data_get($filterValue, 'olimpiade_id');
        $regType = data_get($filterValue, 'registration_type');
        $eventYear = data_get($filterValue, 'event_year');
        $payStatus = data_get($filterValue, 'payment_status');
        $branchFilter = data_get($filterValue, 'branch');

        $query
            ->when(filled($status) && $status !== 'all', fn ($q) => $q->where('status', $status))
            ->when(filled($olimpiadeId) && $olimpiadeId !== 'all', fn ($q) => $q->where('olimpiade_id', $olimpiadeId))
            ->when(filled($regType) && $regType !== 'all', fn ($q) => $q->where('registration_type', $regType))
            ->when(filled($eventYear) && $eventYear !== 'all', fn ($q) => $q->where('event_year', $eventYear))
            ->when(filled($payStatus) && $payStatus !== 'all', fn ($q) => $q->where('payment_status', $payStatus))
            ->when(filled($branchFilter) && $branchFilter !== 'all', fn ($q) => $q->where('branch', $branchFilter))
            ->orderBy($orderBy, $direction)
            ->orderBy('id', 'desc');

        $perPage = min($request->integer('perPage') ?: 10, 100);

        $data = $query->paginate($perPage, ['*'], 'page', $request->integer('page') ?: null);
        $data->through(fn (Participant $p) => $this->participantPayload($p));

        return response()->json($data);
    }

    private function payload(UpdateParticipantRequest $request): array
    {
        $data = $request->safe()->except([
            'payment_proof',
            'full_name',
            'nickname',
            'gender',
            'birth_place',
            'birth_date',
            'school_name',
            'grade',
            'address',
            'province_id',
            'regency_id',
            'parent_phone',
            'nik',
            'student_card',
        ]);

        if (array_key_exists('penyaluran_sanggar_name', $data) && $data['penyaluran_sanggar_name'] === null) {
            unset($data['penyaluran_sanggar_name']);
        }

        $data['has_joined_before'] = $request->boolean('has_joined_before');
        $data['data_truth_consent'] = $request->boolean('data_truth_consent');
        $data['documentation_consent'] = $request->boolean('documentation_consent');
        $data['rules_consent'] = $request->boolean('rules_consent');

        if (! $data['has_joined_before']) {
            $data['previous_year'] = null;
        }

        return $data;
    }

    private function studentPayload(UpdateParticipantRequest $request): array
    {
        return $request->safe()->only([
            'full_name', 'nickname', 'gender', 'birth_place', 'birth_date',
            'school_name', 'grade', 'address', 'province_id',
            'regency_id', 'parent_phone', 'nik', 'school_level', 'nis',
        ]);
    }

    private function studentFileMap(): array
    {
        return [
            'student_card' => 'student_card_path',
        ];
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
        $payload = $participant->toArray();
        $payload['branch'] = $participant->branch;
        $payload['kantor_name'] = $participant->branch ?? $participant->penyaluran_sanggar_name;

        if ($participant->relationLoaded('student') && $participant->student) {
            $payload['student'] = [
                ...$participant->student->toArray(),
                'student_card_url' => $participant->student->student_card_url,
            ];
        }

        $payload['payment_proof_url'] = $participant->payment_proof_url;

        return $payload;
    }

    private function fileMap(): array
    {
        return [
            'payment_proof' => 'payment_proof_path',
        ];
    }
}
