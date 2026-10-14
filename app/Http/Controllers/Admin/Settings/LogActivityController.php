<?php

namespace App\Http\Controllers\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Models\Core\LogActivity;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogActivityController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', LogActivity::class);

        $events = [
            ['id' => 'all', 'name' => 'Semua Event'],
            ['id' => 'created', 'name' => 'Tambah Data (Create)'],
            ['id' => 'updated', 'name' => 'Ubah Data (Update)'],
            ['id' => 'deleted', 'name' => 'Hapus Data (Delete)'],
        ];

        $subjectTypes = [
            ['id' => 'all', 'name' => 'Semua Modul'],
            ['id' => 'App\Models\Company\Participant', 'name' => 'Peserta (Participant)'],
            ['id' => 'App\Models\Company\Student', 'name' => 'Siswa (Student)'],
            ['id' => 'App\Models\Company\Olimpiade', 'name' => 'Olimpiade'],
            ['id' => 'App\Models\Core\User', 'name' => 'Pengguna (User)'],
            ['id' => 'App\Models\Core\Role', 'name' => 'Peran (Role)'],
            ['id' => 'App\Models\Core\Permission', 'name' => 'Izin (Permission)'],
            ['id' => 'App\Models\Company\Period', 'name' => 'Periode'],
            ['id' => 'App\Models\Company\Slider', 'name' => 'Slider'],
            ['id' => 'App\Models\Company\Review', 'name' => 'Ulasan'],
            ['id' => 'App\Models\Company\Testimonial', 'name' => 'Testimoni'],
            ['id' => 'App\Models\Company\FaqCompany', 'name' => 'FAQ'],
        ];

        return Inertia::render('admin/core/log-activity/list', [
            'events' => $events,
            'subjectTypes' => $subjectTypes,
        ]);
    }

    public function getData(Request $request)
    {
        $this->authorize('data-log-activity', LogActivity::class);

        $perPage = (int) ($request->input('perPage', 10) ?: 10);
        $page = (int) ($request->input('page', 1) ?: 1);
        $globalSearch = (string) $request->input('globalSearch', '');
        $orderDirection = strtolower((string) $request->input('orderDirection', 'desc')) === 'asc' ? 'asc' : 'desc';
        $orderBy = $request->input('orderBy', 'id');
        $allowedSorts = ['id', 'log_name', 'event', 'subject_type', 'subject_id', 'created_at'];
        if (! in_array($orderBy, $allowedSorts, true)) {
            $orderBy = 'id';
        }

        $filterValue = $request->input('filterValue', []);
        if (is_string($filterValue)) {
            $filterValue = json_decode($filterValue, true) ?? [];
        }

        $event = data_get($filterValue, 'event');
        $subjectType = data_get($filterValue, 'subject_type');
        $dateFrom = data_get($filterValue, 'date_from') ?: data_get($filterValue, 'filterDate');
        $dateTo = data_get($filterValue, 'date_to');

        $query = LogActivity::query()
            ->with(['causer:id,name,email,branch'])
            ->when(filled($event) && $event !== 'all', fn ($q) => $q->where('event', $event))
            ->when(filled($subjectType) && $subjectType !== 'all', fn ($q) => $q->where('subject_type', $subjectType))
            ->when(filled($dateFrom), function ($q) use ($dateFrom) {
                try {
                    $q->whereDate('created_at', '>=', Carbon::parse($dateFrom)->format('Y-m-d'));
                } catch (\Throwable $e) {
                }
            })
            ->when(filled($dateTo), function ($q) use ($dateTo) {
                try {
                    $q->whereDate('created_at', '<=', Carbon::parse($dateTo)->format('Y-m-d'));
                } catch (\Throwable $e) {
                }
            })
            ->search($globalSearch)
            ->orderBy($orderBy, $orderDirection);

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $paginated->through(function (LogActivity $log) {
            $diffFields = $log->diff_fields;
            $firstDiff = $diffFields[0] ?? null;

            return [
                'id' => $log->id,
                'log_name' => $log->log_name,
                'description' => $log->description,
                'event' => $log->event ?: $log->description,
                'subject_type' => $log->subject_type,
                'subject_name' => $log->subject_name,
                'subject_id' => $log->subject_id,
                'causer_id' => $log->causer_id,
                'causer_name' => $log->causer?->name ?? 'Sistem',
                'causer_email' => $log->causer?->email,
                'causer_branch' => $log->causer?->branch,
                'diff_fields' => $diffFields,
                'diff_count' => count($diffFields),
                'first_diff' => $firstDiff,
                'properties' => $log->properties,
                'created_at' => $log->created_at?->toIso8601String(),
                'updated_at' => $log->updated_at?->toIso8601String(),
            ];
        });

        return response()->json($paginated);
    }
}
