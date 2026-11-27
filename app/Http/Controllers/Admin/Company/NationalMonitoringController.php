<?php

namespace App\Http\Controllers\Admin\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\EventCheckInLog;
use App\Models\Company\NationalParticipant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class NationalMonitoringController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole('Administrators'), 403, 'Hanya Administrator yang dapat mengakses halaman monitoring peserta nasional.');

        $today = today()->toDateString();
        $verifiedParticipantIds = NationalParticipant::where('status', 'verified')->pluck('participant_id');
        $total = $verifiedParticipantIds->count();
        $checkedInToday = EventCheckInLog::query()
            ->where('target_type', 'participant')
            ->whereIn('target_id', $verifiedParticipantIds)
            ->whereDate('event_date', $today)
            ->distinct('target_id')
            ->count('target_id');
        $packReceived = NationalParticipant::where('status', 'verified')
            ->whereNotNull('pack_received_at')
            ->count();

        return Inertia::render('admin/company/national-monitoring/index', [
            'stats' => [
                'total' => $total,
                'checked_in_today' => $checkedInToday,
                'not_checked_in_today' => max(0, $total - $checkedInToday),
                'pack_received' => $packReceived,
            ],
            'checkpoints' => EventCheckInLog::CHECKPOINT_OPTIONS,
            'todayLabel' => now()->translatedFormat('l, d F Y'),
        ]);
    }

    public function getData(Request $request): JsonResponse
    {
        abort_unless($request->user()?->hasRole('Administrators'), 403);

        $today = today()->toDateString();
        $search = trim((string) $request->input('globalSearch', ''));
        $checkpointFilter = trim((string) ($request->input('filterValue.checkpoint') ?? $request->input('checkpoint', '')));
        $statusFilter = trim((string) ($request->input('filterValue.status') ?? $request->input('status', '')));

        $nationalParticipants = NationalParticipant::query()
            ->where('status', 'verified')
            ->with([
                'participant:id,student_id,olimpiade_id,registration_number,branch,status',
                'participant.student:id,full_name,school_name,school_level,grade',
                'participant.olimpiade:id,name,category',
            ])
            ->orderBy('id', 'desc')
            ->get();

        $todayLogsByParticipant = EventCheckInLog::query()
            ->where('target_type', 'participant')
            ->whereDate('event_date', $today)
            ->orderBy('checked_in_at', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->groupBy('target_id');

        $mapped = $nationalParticipants->map(function (NationalParticipant $np) use ($todayLogsByParticipant) {
            $participant = $np->participant;
            $logs = $todayLogsByParticipant->get($np->participant_id, collect());
            $latestLog = $logs->last();

            return [
                'id' => $np->id,
                'participant_id' => $np->participant_id,
                'registration_number' => $participant?->registration_number ?? '-',
                'name' => $participant?->student?->full_name ?? '-',
                'school_name' => $participant?->student?->school_name ?? '-',
                'branch' => $participant?->branch ?? '-',
                'olimpiade' => $participant?->olimpiade?->name ?? '-',
                'pack_received' => $np->pack_received_at !== null,
                'pack_received_at' => $np->pack_received_at?->format('d M Y H:i'),
                'has_checked_in_today' => $logs->isNotEmpty(),
                'latest_checkpoint' => $latestLog?->checkpoint,
                'latest_checkpoint_label' => $latestLog?->checkpoint_label,
                'latest_checked_in_at' => $latestLog?->checked_in_at?->format('H:i'),
                'today_logs' => $logs->map(fn (EventCheckInLog $log) => [
                    'id' => $log->id,
                    'checkpoint' => $log->checkpoint,
                    'checkpoint_label' => $log->checkpoint_label,
                    'time' => $log->checked_in_at?->format('H:i'),
                ])->values(),
            ];
        });

        $filtered = $mapped->filter(function (array $row) use ($search, $checkpointFilter, $statusFilter) {
            if ($search !== '') {
                $q = mb_strtolower($search);
                $haystack = mb_strtolower($row['name'].' '.$row['registration_number'].' '.$row['branch'].' '.$row['school_name']);
                if (! str_contains($haystack, $q)) {
                    return false;
                }
            }

            if ($checkpointFilter !== '' && $row['latest_checkpoint'] !== $checkpointFilter) {
                return false;
            }

            if ($statusFilter === 'checked_in' && ! $row['has_checked_in_today']) {
                return false;
            }

            if ($statusFilter === 'not_checked_in' && $row['has_checked_in_today']) {
                return false;
            }

            return true;
        })->values();

        $orderBy = $request->input('orderBy') ?? $request->input('sorting.0.id', 'id');
        $orderDirection = strtolower((string) ($request->input('orderDirection') ?? ($request->boolean('sorting.0.desc', true) ? 'desc' : 'asc'))) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'registration_number', 'name', 'branch', 'latest_checked_in_at', 'pack_received'];

        if (in_array($orderBy, $allowedSorts, true)) {
            $filtered = $orderDirection === 'asc'
                ? $filtered->sortBy($orderBy)->values()
                : $filtered->sortByDesc($orderBy)->values();
        }

        $perPage = min(max((int) ($request->input('perPage') ?? $request->input('pageSize') ?? $request->input('pagination.pageSize') ?? 10), 1), 100);
        $page = max((int) $request->input('page', 1), 1);

        $paginator = new LengthAwarePaginator(
            $filtered->forPage($page, $perPage)->values(),
            $filtered->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return response()->json($paginator);
    }

    public function resetCheckIn(Request $request, NationalParticipant $nationalParticipant): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('Administrators'), 403);

        $logId = $request->integer('log_id') ?: null;

        if ($logId) {
            EventCheckInLog::where('id', $logId)
                ->where('target_type', 'participant')
                ->where('target_id', $nationalParticipant->participant_id)
                ->delete();

            return back()->with('success', 'Log kehadiran pada pos tersebut berhasil di-reset.');
        }

        EventCheckInLog::where('target_type', 'participant')
            ->where('target_id', $nationalParticipant->participant_id)
            ->whereDate('event_date', today()->toDateString())
            ->delete();

        return back()->with('success', 'Seluruh log kehadiran hari ini untuk peserta tersebut berhasil di-reset.');
    }

    public function resetPack(Request $request, NationalParticipant $nationalParticipant): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('Administrators'), 403);

        $nationalParticipant->updateQuietly([
            'pack_received_at' => null,
            'pack_received_by' => null,
        ]);

        return back()->with('success', 'Status penyerahan Event Kit berhasil di-reset.');
    }
}
