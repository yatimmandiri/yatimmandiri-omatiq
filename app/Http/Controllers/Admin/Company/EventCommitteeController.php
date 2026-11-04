<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreEventCommitteeRequest;
use App\Http\Requests\Company\UpdateEventCommitteeRequest;
use App\Models\Company\EventCommittee;
use App\Models\Core\User;
use App\Services\BarcodeService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

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
            'checked_in' => EventCommittee::whereNotNull('checked_in_at')->count(),
            'inactive' => EventCommittee::where('status', 'inactive')->count(),
        ];

        $divisions = EventCommittee::query()
            ->select('division')
            ->distinct()
            ->orderBy('division')
            ->pluck('division')
            ->values();

        return Inertia::render('admin/company/committees/list', [
            'stats' => $stats,
            'divisions' => $divisions,
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
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhereRaw('LOWER(division) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(position) LIKE ?', ["%{$search}%"]);
            });
        }

        $sortField = $request->input('sorting.0.id', 'id');
        $sortDesc = $request->boolean('sorting.0.desc', true);
        $allowedSorts = ['id', 'code', 'name', 'division', 'position', 'status', 'checked_in_at', 'created_at'];

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
            ->whereNull('checked_in_at')
            ->update(['checked_in_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => "Berhasil mencatat kehadiran ({$updated} panitia ditandai hadir).",
            'count' => $updated,
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
