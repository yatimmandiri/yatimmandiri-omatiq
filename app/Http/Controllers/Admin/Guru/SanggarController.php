<?php

namespace App\Http\Controllers\Admin\Guru;

use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use App\Services\PenyaluranService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SanggarController extends Controller
{
    public function __construct(private readonly PenyaluranService $penyaluran) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Participant::class);

        return Inertia::render('admin/guru/data-sanggar/list');
    }

    public function getData(Request $request)
    {
        $this->authorize('viewAny', Participant::class);

        $token = $request->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
        $sanggars = [];
        if ($token) {
            try {
                $sanggars = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }

        $search = strtolower($request->string('globalSearch')->toString());
        $collection = collect($sanggars)
            ->when($search !== '', fn ($c) => $c->filter(fn (array $s) => str_contains(strtolower($s['name'] ?? ''), $search) || str_contains(strtolower($s['type'] ?? ''), $search)))
            ->values();

        $perPage = min($request->integer('perPage') ?: 10, 100);
        $page = max(1, $request->integer('page') ?: 1);
        $total = $collection->count();
        $items = $collection->forPage($page, $perPage)->values();

        return response()->json([
            'data' => $items,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => (int) ceil($total / $perPage),
        ]);
    }

    public function show(int $id)
    {
        $this->authorize('viewAny', Participant::class);

        $token = request()->session()->get('penyaluran_token') ?? Auth::user()?->penyaluran_token;
        $sanggars = [];
        if ($token) {
            try {
                $sanggars = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }
        $sanggar = collect($sanggars)->firstWhere(fn (array $s) => (int) ($s['id'] ?? 0) === $id);
        if (! $sanggar) {
            abort(404);
        }

        return Inertia::render('admin/guru/data-sanggar/show', ['sanggar' => $sanggar]);
    }
}
