<?php

namespace App\Http\Controllers\Admin\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Participant;
use App\Models\Core\User;
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

        $user = Auth::user();
        $isCabang = $user?->hasRole('Cabang') ?? false;
        $userBranch = $isCabang ? $user->getBranchName() : null;

        return Inertia::render('admin/company/sanggars/list', [
            'userBranch' => $userBranch,
        ]);
    }

    public function getData(Request $request)
    {
        $this->authorize('viewAny', Participant::class);

        $user = Auth::user();
        $isCabang = $user?->hasRole('Cabang') ?? false;
        $userBranch = $isCabang ? $user->getBranchName() : null;

        $token = ($request->hasSession() ? $request->session()->get('penyaluran_token') : null)
            ?? $user?->penyaluran_token
            ?? (! app()->environment('testing') ? User::role('Teacher')->whereNotNull('penyaluran_token')->value('penyaluran_token') : null);

        // Primary source: global sanggars via X-API-KEY (api/v1/sanggars) - per instruction
        $apiSanggars = [];
        try {
            $apiSanggars = $this->penyaluran->allSanggars();
        } catch (\Throwable $e) {
            $apiSanggars = [];
        }

        // Fallback to guru-specific sanggars if global fetch returned empty
        if (empty($apiSanggars) && $token) {
            try {
                $apiSanggars = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $apiSanggars = [];
            }
        }

        // Also gather sanggars from database participants
        $dbQuery = Participant::query()
            ->whereNotNull('penyaluran_sanggar_name')
            ->where('penyaluran_sanggar_name', '<>', '')
            ->selectRaw('penyaluran_sanggar_id as id, penyaluran_sanggar_name as name, branch, count(*) as participant_count')
            ->groupBy('penyaluran_sanggar_id', 'penyaluran_sanggar_name', 'branch');

        if ($isCabang && filled($userBranch)) {
            $dbQuery->where('branch', $userBranch);
        }

        $dbSanggars = $dbQuery
            ->get()
            ->map(fn ($row) => [
                'id' => (int) ($row->id ?: crc32($row->name ?? $row->penyaluran_sanggar_name)),
                'name' => $row->name ?? $row->penyaluran_sanggar_name,
                'type' => 'Sanggar Binaan',
                'kantor_name' => $row->branch ?? $row->kantor_name,
                'participant_count' => (int) $row->participant_count,
            ])
            ->all();

        // Keep API sanggars intact (588 rows include 11 duplicate names with different IDs/kantor) — do NOT dedupe by name.
        // Only dedupe DB entries against API by ID to avoid double counting same sanggar from participants table.
        $apiIds = collect($apiSanggars)->pluck('id')->map(fn ($v) => (int) $v)->filter()->all();
        $filteredDb = collect($dbSanggars)->filter(fn ($item) => ! in_array((int) ($item['id'] ?? 0), $apiIds, true))->values();
        $merged = collect([...$apiSanggars, ...$filteredDb])->values();

        // Strict branch filter for role Cabang
        if ($isCabang && filled($userBranch)) {
            $merged = $merged->filter(function ($item) use ($userBranch) {
                $kantor = $item['kantor_name'] ?? $item['branch'] ?? '';

                return stripos((string) $kantor, $userBranch) !== false;
            })->values();
        }

        $search = strtolower($request->string('globalSearch')->toString());
        if ($search !== '') {
            $merged = $merged->filter(function ($item) use ($search) {
                $name = strtolower($item['name'] ?? '');
                $type = strtolower($item['type'] ?? '');
                $kantor = strtolower($item['kantor_name'] ?? '');

                return str_contains($name, $search) || str_contains($type, $search) || str_contains($kantor, $search);
            })->values();
        }

        $perPage = min($request->integer('perPage') ?: 10, 100);
        $page = max(1, $request->integer('page') ?: 1);
        $total = $merged->count();
        $items = $merged->forPage($page, $perPage)->values();

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

    public function show(int $sanggar)
    {
        $this->authorize('viewAny', Participant::class);

        $user = Auth::user();
        $isCabang = $user?->hasRole('Cabang') ?? false;
        $userBranch = $isCabang ? $user->getBranchName() : null;

        $token = request()->session()->get('penyaluran_token')
            ?? $user?->penyaluran_token
            ?? (! app()->environment('testing') ? User::role('Teacher')->whereNotNull('penyaluran_token')->value('penyaluran_token') : null);

        $sanggars = [];
        try {
            $sanggars = $this->penyaluran->allSanggars();
        } catch (\Throwable $e) {
            $sanggars = [];
        }

        if (empty($sanggars) && $token) {
            try {
                $sanggars = $this->penyaluran->sanggars($token);
            } catch (\Throwable $e) {
                $sanggars = [];
            }
        }

        $found = collect($sanggars)->firstWhere(fn (array $s) => (int) ($s['id'] ?? 0) === $sanggar);

        if (! $found) {
            // Check DB fallback
            $dbRow = Participant::query()
                ->where('penyaluran_sanggar_id', $sanggar)
                ->first();

            if ($dbRow) {
                $found = [
                    'id' => (int) ($dbRow->penyaluran_sanggar_id ?: $sanggar),
                    'name' => $dbRow->penyaluran_sanggar_name,
                    'type' => 'Sanggar Binaan',
                    'kantor_name' => $dbRow->branch,
                    'branch' => $dbRow->branch,
                ];
            }
        }

        if (! $found) {
            abort(404);
        }

        // Strict branch check for Cabang role
        if ($isCabang && filled($userBranch)) {
            $sanggarBranch = $found['kantor_name'] ?? $found['branch'] ?? '';
            if (stripos((string) $sanggarBranch, $userBranch) === false) {
                abort(403);
            }
        }

        return Inertia::render('admin/company/sanggars/show', [
            'sanggar' => $found,
        ]);
    }
}
