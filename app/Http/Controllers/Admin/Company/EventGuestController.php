<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\UploadFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreEventGuestRequest;
use App\Http\Requests\Company\UpdateEventGuestRequest;
use App\Models\Company\EventGuest;
use App\Services\BarcodeService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EventGuestController extends Controller
{
    use UploadFiles;

    public function __construct(
        protected BarcodeService $barcodeService,
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', EventGuest::class);

        $stats = [
            'total' => EventGuest::count(),
            'attended' => EventGuest::whereNotNull('checked_in_at')->count(),
            'confirmed' => EventGuest::where('status', 'confirmed')->count(),
            'vvip' => EventGuest::where('category', 'vvip')->count(),
            'vip' => EventGuest::where('category', 'vip')->count(),
        ];

        return Inertia::render('admin/company/guests/list', [
            'stats' => $stats,
        ]);
    }

    public function getData(Request $request): JsonResponse
    {
        $this->authorize('viewAny', EventGuest::class);

        $query = EventGuest::query()->with('creator:id,name');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('category')) {
            $query->where('category', $request->string('category')->toString());
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
                    ->orWhereRaw('LOWER(institution) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(position) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(table_number) LIKE ?', ["%{$search}%"]);
            });
        }

        $sortField = $request->input('sorting.0.id', 'id');
        $sortDesc = $request->boolean('sorting.0.desc', true);
        $allowedSorts = ['id', 'code', 'name', 'institution', 'position', 'category', 'status', 'checked_in_at', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDesc ? 'desc' : 'asc');
        } else {
            $query->orderByDesc('id');
        }

        $perPage = (int) $request->input('pagination.pageSize', 10);
        $guests = $query->paginate($perPage);

        return response()->json($guests);
    }

    public function create(): Response
    {
        $this->authorize('create', EventGuest::class);

        return Inertia::render('admin/company/guests/create', [
            'suggestedCode' => EventGuest::generateCode(),
        ]);
    }

    public function store(StoreEventGuestRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['code'] = EventGuest::generateCode();
        $data['created_by'] = Auth::id();
        $data['event_year'] = 2026;
        $data['seat_count'] = $data['seat_count'] ?? 1;

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->uploadFile(null, $request->file('photo'), 'guests/photos');
        }

        unset($data['photo']);

        $guest = EventGuest::create($data);

        return redirect()->route('admin.companies.guests.index')
            ->with('success', "Tamu undangan {$guest->name} ({$guest->code}) berhasil ditambahkan.");
    }

    public function show(EventGuest $guest): Response
    {
        $this->authorize('view', $guest);

        $guest->load('creator:id,name');

        return Inertia::render('admin/company/guests/show', [
            'guest' => $guest,
            'photoUrl' => $guest->photo_url,
            'verifyUrl' => route('home.guest.verify', ['code' => $guest->code]),
        ]);
    }

    public function edit(EventGuest $guest): Response
    {
        $this->authorize('update', $guest);

        return Inertia::render('admin/company/guests/edit', [
            'guest' => $guest,
            'photoUrl' => $guest->photo_url,
        ]);
    }

    public function update(UpdateEventGuestRequest $request, EventGuest $guest): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->uploadFile($guest->photo_path, $request->file('photo'), 'guests/photos');
        }

        unset($data['photo']);

        $guest->update($data);

        return redirect()->route('admin.companies.guests.index')
            ->with('success', "Data tamu undangan {$guest->name} berhasil diperbarui.");
    }

    public function destroy(EventGuest $guest): RedirectResponse
    {
        $this->authorize('delete', $guest);

        if ($guest->photo_path) {
            $this->deleteFile($guest->photo_path);
        }

        $guest->delete();

        return redirect()->route('admin.companies.guests.index')
            ->with('success', "Tamu undangan {$guest->name} berhasil dihapus.");
    }

    public function status(Request $request, EventGuest $guest): RedirectResponse
    {
        $this->authorize('update', $guest);

        $request->validate(['status' => 'required|in:invited,confirmed,attended,declined']);
        $newStatus = $request->string('status')->toString();

        $guest->update(['status' => $newStatus]);

        return back()->with('success', "Status tamu diubah menjadi {$newStatus}.");
    }

    public function bulkCheckIn(Request $request): JsonResponse
    {
        $this->authorize('update', new EventGuest);

        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:event_guests,id',
        ]);

        $ids = $request->input('ids');
        $updated = EventGuest::whereIn('id', $ids)
            ->whereNull('checked_in_at')
            ->update([
                'checked_in_at' => now(),
                'status' => 'attended',
            ]);

        return response()->json([
            'success' => true,
            'message' => "Berhasil mencatat kedatangan ({$updated} tamu ditandai hadir).",
            'count' => $updated,
        ]);
    }

    public function printCard(Request $request, EventGuest $guest)
    {
        $this->authorize('view', $guest);

        $verifyUrl = route('home.registration.verify', ['registrationNumber' => $guest->code]);
        $qrCodeSvg = $this->barcodeService->generateQrCodeSvg($verifyUrl, size: 85, color: '#111827');
        $barcodeSvg = $this->barcodeService->generateCode128Svg($guest->code, height: 26, barWidth: 1.1, color: '#111827');

        if ($request->query('format') === 'pdf') {
            $pdf = Pdf::loadView('cards.guest-card', compact('guest', 'verifyUrl', 'qrCodeSvg', 'barcodeSvg'))
                ->setPaper('a4', 'portrait');

            return $pdf->stream("Kartu-Pass-Undangan-{$guest->code}.pdf");
        }

        return view('cards.guest-card', compact('guest', 'verifyUrl', 'qrCodeSvg', 'barcodeSvg'));
    }
}
