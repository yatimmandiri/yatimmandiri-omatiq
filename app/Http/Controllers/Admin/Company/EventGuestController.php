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
use Illuminate\Support\Str;
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
            'attended' => EventGuest::whereDate('checked_in_at', today())->count(),
            'confirmed' => EventGuest::where('status', 'confirmed')->count(),
            'declined' => EventGuest::where('status', 'declined')->count(),
            'vip' => EventGuest::where('category', 'vip')->count(),
            'non_vip' => EventGuest::whereIn('category', ['non_vip', 'non-vip', 'umum'])->count(),
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

        $guests->getCollection()->transform(function (EventGuest $g) {
            $g->rsvp_url = $g->rsvp_url;

            return $g;
        });

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

        $isVip = strtolower((string) ($data['category'] ?? 'vip')) === 'vip';
        if ($isVip) {
            $data['rsvp_token'] = Str::random(40);
            $data['status'] = $data['status'] ?? 'invited';
        } else {
            $data['status'] = $data['status'] ?? 'confirmed';
        }

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->uploadFile(null, $request->file('photo'), 'guests/photos');
        }

        unset($data['photo'], $data['send_invitation']);

        $guest = EventGuest::create($data);

        return redirect()->route('admin.companies.guests.index')
            ->with('success', "Tamu undangan {$guest->name} ({$guest->code}) berhasil ditambahkan. Silakan unduh QR Code konfirmasi untuk ditempelkan pada kartu fisik undangan.");
    }

    public function show(EventGuest $guest): Response
    {
        $this->authorize('view', $guest);

        $guest->load('creator:id,name');

        return Inertia::render('admin/company/guests/show', [
            'guest' => $guest,
            'photoUrl' => $guest->photo_url,
            'verifyUrl' => route('home.registration.verify', ['registrationNumber' => $guest->code]),
            'rsvpUrl' => $guest->rsvp_url,
        ]);
    }

    public function edit(EventGuest $guest): Response
    {
        $this->authorize('update', $guest);

        return Inertia::render('admin/company/guests/edit', [
            'guest' => $guest,
            'photoUrl' => $guest->photo_url,
            'rsvpUrl' => $guest->rsvp_url,
        ]);
    }

    public function update(UpdateEventGuestRequest $request, EventGuest $guest): RedirectResponse
    {
        $data = $request->validated();

        $isVip = strtolower((string) ($data['category'] ?? 'vip')) === 'vip';
        if ($isVip && ! $guest->rsvp_token) {
            $data['rsvp_token'] = Str::random(40);
        }

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->uploadFile($guest->photo_path, $request->file('photo'), 'guests/photos');
        }

        unset($data['photo']);

        $guest->update($data);

        return redirect()->route('admin.companies.guests.index')
            ->with('success', "Data tamu undangan {$guest->name} berhasil diperbarui.");
    }

    public function downloadRsvpQr(EventGuest $guest)
    {
        $this->authorize('view', $guest);

        $url = $guest->rsvp_url ?: route('home.guest.rsvp', ['identifier' => $guest->code]);
        $pngData = $this->barcodeService->generateQrCodePng($url, size: 500, color: '#17524A');

        $safeName = Str::slug($guest->name, '-');
        $fileName = "QR-RSVP-{$guest->code}-{$safeName}.png";

        return response($pngData, 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }

    public function bulkDownloadRsvpQr(Request $request)
    {
        $this->authorize('viewAny', EventGuest::class);

        $request->validate([
            'ids' => 'nullable|array',
            'ids.*' => 'integer|exists:event_guests,id',
            'all' => 'nullable|boolean',
        ]);

        $query = EventGuest::query()->where('event_year', 2026);

        if (! $request->boolean('all')) {
            $ids = $request->input('ids', []);
            if (empty($ids)) {
                return response()->json(['message' => 'Tidak ada tamu yang dipilih.'], 422);
            }
            $query->whereIn('id', $ids);
        }

        $guests = $query->orderBy('code')->get();
        if ($guests->isEmpty()) {
            return response()->json(['message' => 'Tidak ada data tamu yang ditemukan untuk diunduh.'], 422);
        }

        $count = $guests->count();
        $zipFileName = "QR-RSVP-Tamu-VIP-OMATIQ-2026-({$count}-Tamu).zip";
        $tempPath = storage_path('app/temp');
        if (! is_dir($tempPath)) {
            mkdir($tempPath, 0755, true);
        }
        $zipFullPath = $tempPath.'/'.$zipFileName;

        $zip = new \ZipArchive;
        if ($zip->open($zipFullPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Gagal membuat file arsip ZIP.'], 500);
        }

        foreach ($guests as $guest) {
            $url = $guest->rsvp_url ?: route('home.guest.rsvp', ['identifier' => $guest->code]);
            $pngData = $this->barcodeService->generateQrCodePng($url, size: 600, color: '#17524A');
            $safeName = Str::slug($guest->name, '-');
            $imageName = "QR-RSVP-{$guest->code}-{$safeName}.png";

            $zip->addFromString($imageName, $pngData);
        }

        $zip->close();

        return response()->download($zipFullPath, $zipFileName)->deleteFileAfterSend(true);
    }

    public function resetRsvp(EventGuest $guest): RedirectResponse
    {
        $this->authorize('update', $guest);

        $guest->updateQuietly([
            'status' => 'invited',
            'confirmed_at' => null,
            'checked_in_at' => null,
        ]);

        return back()->with('success', "Status konfirmasi RSVP tamu {$guest->name} berhasil di-reset. Formulir konfirmasi tamu sekarang dapat diisi kembali.");
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
            ->where(function ($q) {
                $q->whereNull('checked_in_at')
                    ->orWhereDate('checked_in_at', '<', today());
            })
            ->update([
                'checked_in_at' => now(),
                'status' => 'attended',
            ]);

        return response()->json([
            'success' => true,
            'message' => "Berhasil mencatat kedatangan ({$updated} tamu ditandai hadir hari ini).",
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
