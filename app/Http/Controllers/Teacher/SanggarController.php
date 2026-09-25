<?php

namespace App\Http\Controllers\Teacher;

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

        return Inertia::render('teacher/data-sanggar/list');
    }

    public function getData(Request $request)
    {
        $this->authorize('viewAny', Participant::class);

        $user = Auth::user();
        $token = $request->session()->get('penyaluran_token') ?? $user?->penyaluran_token;

        $queryParams = array_filter([
            'kantor_id' => $request->input('kantor_id', $user?->kantor_id),
            'teacher_id' => $request->input('teacher_id', $user?->teacher_id),
        ], fn ($v) => filled($v));

        $sanggars = [];
        try {
            $sanggars = $this->penyaluran->allSanggars($queryParams);
            if (empty($sanggars) && ! empty($queryParams)) {
                $sanggars = $this->penyaluran->allSanggars();
            }
        } catch (\Throwable $e) {
            $sanggars = [];
        }

        if (empty($sanggars) && $token) {
            try {
                $sanggars = $this->penyaluran->sanggars($token ?? 'session');
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }

        if (! empty($sanggars) && $token) {
            try {
                $sanggars = $this->penyaluran->enrichSanggarsWithStudentCounts($sanggars, $token);
            } catch (\Throwable $e) {
            }
        }

        $search = strtolower($request->string('globalSearch')->toString());
        $collection = collect($sanggars)
            ->when($search !== '', fn ($c) => $c->filter(fn (array $s) => str_contains(strtolower($s['name'] ?? ''), $search) || str_contains(strtolower($s['type'] ?? ''), $search) || str_contains(strtolower($s['kantor_name'] ?? ''), $search)))
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
            'from' => $total > 0 ? ($page - 1) * $perPage + 1 : 0,
            'to' => $total > 0 ? min($page * $perPage, $total) : 0,
            'last_page' => (int) ceil($total / $perPage),
        ]);
    }

    public function show(int $id)
    {
        $this->authorize('viewAny', Participant::class);

        $user = Auth::user();
        $token = request()->session()->get('penyaluran_token') ?? $user?->penyaluran_token;

        $sanggars = [];
        try {
            $sanggars = $this->penyaluran->allSanggars();
        } catch (\Throwable $e) {
            $sanggars = [];
        }

        if (empty($sanggars) && $token) {
            try {
                $sanggars = $this->penyaluran->sanggars($token ?? 'session');
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }

        if (! empty($sanggars) && $token) {
            try {
                $sanggars = $this->penyaluran->enrichSanggarsWithStudentCounts($sanggars, $token);
            } catch (\Throwable $e) {
            }
        }

        $sanggar = collect($sanggars)->firstWhere(fn (array $s) => (int) ($s['id'] ?? 0) === $id);
        if (! $sanggar) {
            abort(404);
        }

        return Inertia::render('teacher/data-sanggar/show', ['sanggar' => $sanggar]);
    }
}
