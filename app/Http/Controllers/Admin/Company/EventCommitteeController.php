<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreEventCommitteeRequest;
use App\Http\Requests\Company\UpdateEventCommitteeRequest;
use App\Models\Company\EventCommittee;
use App\Models\Core\User;
use App\Services\BarcodeService;
use App\Services\Company\CommitteeImportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EventCommitteeController extends Controller
{
    use UploadFiles;

    public function __construct(
        protected BarcodeService $barcodeService,
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', EventCommittee::class);

        $stats = [
            'total' => EventCommittee::count(),
            'active' => EventCommittee::where('status', 'active')->count(),
            'checked_in' => EventCommittee::whereDate('checked_in_at', today())->count(),
            'inactive' => EventCommittee::where('status', 'inactive')->count(),
        ];

        $divisions = EventCommittee::query()
            ->select('division')
            ->distinct()
            ->orderBy('division')
            ->pluck('division')
            ->values();

        $branches = EventCommittee::query()
            ->select('branch')
            ->whereNotNull('branch')
            ->where('branch', '!=', '')
            ->distinct()
            ->orderBy('branch')
            ->pluck('branch')
            ->values();

        return Inertia::render('admin/company/committees/list', [
            'stats' => $stats,
            'divisions' => $divisions,
            'branches' => $branches,
        ]);
    }

    public function getData(Request $request): JsonResponse
    {
        $this->authorize('viewAny', EventCommittee::class);

        $query = EventCommittee::query()->with(['user:id,name,email', 'creator:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('division')) {
            $query->where('division', $request->string('division')->toString());
        }

        if ($request->filled('branch')) {
            $query->where('branch', $request->string('branch')->toString());
        }

        if ($request->filled('checked_in')) {
            if ($request->string('checked_in')->toString() === 'yes') {
                $query->whereNotNull('checked_in_at');
            } elseif ($request->string('checked_in')->toString() === 'no') {
                $query->whereNull('checked_in_at');
            }
        }

        if ($request->filled('globalSearch')) {
            $search = strtolower(trim($request->string('globalSearch')->toString()));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(code) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(branch) LIKE ?', ["%{$search}%"])
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhereRaw('LOWER(division) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(position) LIKE ?', ["%{$search}%"]);
            });
        }

        $sortField = $request->input('sorting.0.id', 'id');
        $sortDesc = $request->boolean('sorting.0.desc', true);
        $allowedSorts = ['id', 'code', 'name', 'branch', 'division', 'position', 'shirt_size', 'status', 'checked_in_at', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDesc ? 'desc' : 'asc');
        } else {
            $query->orderByDesc('id');
        }

        $perPage = (int) $request->input('pagination.pageSize', 10);
        $committees = $query->paginate($perPage);

        return response()->json($committees);
    }

    public function create(): Response
    {
        $this->authorize('create', EventCommittee::class);

        $users = User::role('Administrators')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/company/committees/create', [
            'users' => $users,
            'suggestedCode' => EventCommittee::generateCode(),
        ]);
    }

    public function store(StoreEventCommitteeRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['code'] = EventCommittee::generateCode();
        $data['created_by'] = Auth::id();
        $data['event_year'] = 2026;

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->uploadFile(null, $request->file('photo'), 'committees/photos');
        }

        unset($data['photo']);

        $committee = EventCommittee::create($data);

        return redirect()->route('admin.companies.committees.index')
            ->with('success', "Panitia {$committee->name} ({$committee->code}) berhasil ditambahkan.");
    }

    public function show(EventCommittee $committee): Response
    {
        $this->authorize('view', $committee);

        $committee->load(['user:id,name,email', 'creator:id,name']);

        return Inertia::render('admin/company/committees/show', [
            'committee' => $committee,
            'photoUrl' => $committee->photo_url,
            'verifyUrl' => route('home.committee.verify', ['code' => $committee->code]),
        ]);
    }

    public function edit(EventCommittee $committee): Response
    {
        $this->authorize('update', $committee);

        $users = User::role('Administrators')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/company/committees/edit', [
            'committee' => $committee,
            'photoUrl' => $committee->photo_url,
            'users' => $users,
        ]);
    }

    public function update(UpdateEventCommitteeRequest $request, EventCommittee $committee): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->uploadFile($committee->photo_path, $request->file('photo'), 'committees/photos');
        }

        unset($data['photo']);

        $committee->update($data);

        return redirect()->route('admin.companies.committees.index')
            ->with('success', "Data panitia {$committee->name} berhasil diperbarui.");
    }

    public function destroy(EventCommittee $committee): RedirectResponse
    {
        $this->authorize('delete', $committee);

        if ($committee->photo_path) {
            $this->deleteFile($committee->photo_path);
        }

        $committee->delete();

        return redirect()->route('admin.companies.committees.index')
            ->with('success', "Panitia {$committee->name} berhasil dihapus.");
    }

    public function status(Request $request, EventCommittee $committee): RedirectResponse
    {
        $this->authorize('update', $committee);

        $request->validate(['status' => 'required|in:active,inactive']);
        $newStatus = $request->string('status')->toString();

        $committee->update(['status' => $newStatus]);

        return back()->with('success', "Status panitia diubah menjadi {$newStatus}.");
    }

    public function bulkCheckIn(Request $request): JsonResponse
    {
        $this->authorize('update', new EventCommittee);

        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:event_committees,id',
        ]);

        $ids = $request->input('ids');
        $updated = EventCommittee::whereIn('id', $ids)
            ->where(function ($q) {
                $q->whereNull('checked_in_at')
                    ->orWhereDate('checked_in_at', '<', today());
            })
            ->update(['checked_in_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => "Berhasil mencatat kehadiran ({$updated} panitia ditandai hadir hari ini).",
            'count' => $updated,
        ]);
    }

    public function template(CommitteeImportService $importService): StreamedResponse
    {
        $this->authorize('create', EventCommittee::class);

        $csv = $importService->generateTemplateCsv();

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, 'Template-Import-Panitia-OMATIQ.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function import(Request $request, CommitteeImportService $importService): JsonResponse
    {
        $this->authorize('create', EventCommittee::class);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx,xls', 'max:5120'],
            'default_division' => ['nullable', 'string', 'max:100'],
            'update_existing' => ['nullable', 'boolean'],
        ], [
            'file.required' => 'Silakan pilih file spreadsheet (CSV atau Excel) yang akan diimpor.',
            'file.mimes' => 'Format file harus berupa CSV (.csv) atau Excel (.xlsx).',
            'file.max' => 'Ukuran file maksimal adalah 5MB.',
        ]);

        $options = [
            'default_division' => $request->input('default_division', 'Panitia Pelaksana Babak Final'),
            'update_existing' => $request->boolean('update_existing', true),
            'created_by' => Auth::id(),
            'event_year' => 2026,
        ];

        $result = $importService->import($request->file('file'), $options);

        if (! empty($result['errors']) && $result['imported'] === 0 && $result['updated'] === 0) {
            return response()->json([
                'success' => false,
                'message' => $result['errors'][0] ?? 'Gagal mengimpor data panitia.',
                'result' => $result,
            ], 422);
        }

        $msg = "Impor selesai! Berhasil menambahkan {$result['imported']} panitia baru";
        if ($result['updated'] > 0) {
            $msg .= " dan memperbarui {$result['updated']} data panitia.";
        } else {
            $msg .= '.';
        }

        if ($result['skipped'] > 0) {
            $msg .= " ({$result['skipped']} data dilewati).";
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'result' => $result,
        ]);
    }

    public function printCard(Request $request, EventCommittee $committee)
    {
        $this->authorize('view', $committee);

        $verifyUrl = route('home.registration.verify', ['registrationNumber' => $committee->code]);
        $qrCodeSvg = $this->barcodeService->generateQrCodeSvg($verifyUrl, size: 85, color: '#0f172a');
        $barcodeSvg = $this->barcodeService->generateCode128Svg($committee->code, height: 26, barWidth: 1.1, color: '#0f172a');

        if ($request->query('format') === 'pdf') {
            $pdf = Pdf::loadView('cards.committee-card', compact('committee', 'verifyUrl', 'qrCodeSvg', 'barcodeSvg'))
                ->setPaper('a4', 'portrait');

            return $pdf->stream("Kartu-Pass-Panitia-{$committee->code}.pdf");
        }

        return view('cards.committee-card', compact('committee', 'verifyUrl', 'qrCodeSvg', 'barcodeSvg'));
    }
}
