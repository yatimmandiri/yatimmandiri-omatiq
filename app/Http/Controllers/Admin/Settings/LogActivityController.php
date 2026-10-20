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
            ['value' => 'all', 'label' => 'Semua Event', 'id' => 'all', 'name' => 'Semua Event'],
            ['value' => 'created', 'label' => 'Tambah Data (Create)', 'id' => 'created', 'name' => 'Tambah Data (Create)'],
            ['value' => 'updated', 'label' => 'Ubah Data (Update)', 'id' => 'updated', 'name' => 'Ubah Data (Update)'],
            ['value' => 'deleted', 'label' => 'Hapus Data (Delete)', 'id' => 'deleted', 'name' => 'Hapus Data (Delete)'],
        ];

        $subjectTypes = [
            ['value' => 'all', 'label' => 'Semua Modul', 'id' => 'all', 'name' => 'Semua Modul'],
            ['value' => 'App\Models\Company\Participant', 'label' => 'Peserta (Participant)', 'id' => 'App\Models\Company\Participant', 'name' => 'Peserta (Participant)'],
            ['value' => 'App\Models\Company\Student', 'label' => 'Santri / Binaan (Student)', 'id' => 'App\Models\Company\Student', 'name' => 'Santri / Binaan (Student)'],
            ['value' => 'App\Models\Company\Olimpiade', 'label' => 'Olimpiade', 'id' => 'App\Models\Company\Olimpiade', 'name' => 'Olimpiade'],
            ['value' => 'App\Models\Company\OlimpiadeSchedule', 'label' => 'Jadwal Olimpiade', 'id' => 'App\Models\Company\OlimpiadeSchedule', 'name' => 'Jadwal Olimpiade'],
            ['value' => 'App\Models\Company\OlimpiadeObjective', 'label' => 'Tujuan Olimpiade', 'id' => 'App\Models\Company\OlimpiadeObjective', 'name' => 'Tujuan Olimpiade'],
            ['value' => 'App\Models\Company\OlimpiadeGallery', 'label' => 'Galeri Olimpiade', 'id' => 'App\Models\Company\OlimpiadeGallery', 'name' => 'Galeri Olimpiade'],
            ['value' => 'App\Models\Company\OlimpiadeVideo', 'label' => 'Video Olimpiade', 'id' => 'App\Models\Company\OlimpiadeVideo', 'name' => 'Video Olimpiade'],
            ['value' => 'App\Models\Core\User', 'label' => 'Pengguna (User)', 'id' => 'App\Models\Core\User', 'name' => 'Pengguna (User)'],
            ['value' => 'App\Models\Core\Role', 'label' => 'Peran (Role)', 'id' => 'App\Models\Core\Role', 'name' => 'Peran (Role)'],
            ['value' => 'App\Models\Core\Permission', 'label' => 'Izin (Permission)', 'id' => 'App\Models\Core\Permission', 'name' => 'Izin (Permission)'],
            ['value' => 'App\Models\Company\Period', 'label' => 'Periode', 'id' => 'App\Models\Company\Period', 'name' => 'Periode'],
            ['value' => 'App\Models\Company\Slider', 'label' => 'Slider', 'id' => 'App\Models\Company\Slider', 'name' => 'Slider'],
            ['value' => 'App\Models\Company\Review', 'label' => 'Ulasan (Review)', 'id' => 'App\Models\Company\Review', 'name' => 'Ulasan (Review)'],
            ['value' => 'App\Models\Company\Testimonial', 'label' => 'Testimoni', 'id' => 'App\Models\Company\Testimonial', 'name' => 'Testimoni'],
            ['value' => 'App\Models\Company\FaqCompany', 'label' => 'FAQ', 'id' => 'App\Models\Company\FaqCompany', 'name' => 'FAQ'],
        ];

        return Inertia::render('admin/core/log-activity/list', [
            'events' => $events,
            'subjectTypes' => $subjectTypes,
        ]);
    }

    public function getData(Request $request)
    {
        $this->authorize('data-log-activity', LogActivity::class);

        $perPage = min((int) ($request->input('perPage', 10) ?: 10), 100);
        $page = (int) ($request->input('page', 1) ?: 1);
        $globalSearch = (string) $request->input('globalSearch', '');
        $orderDirection = strtolower((string) $request->input('orderDirection', 'desc')) === 'asc' ? 'asc' : 'desc';
        $orderBy = (string) $request->input('orderBy', 'created_at');
        $allowedSorts = ['id', 'log_name', 'event', 'subject_type', 'subject_id', 'created_at'];
        if (! in_array($orderBy, $allowedSorts, true)) {
            $orderBy = 'created_at';
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
            ->when(filled($subjectType) && $subjectType !== 'all', function ($q) use ($subjectType) {
                $base = class_basename($subjectType);
                $q->where(function ($sub) use ($subjectType, $base) {
                    $sub->where('subject_type', $subjectType)
                        ->orWhere('subject_type', 'like', "%{$base}");
                });
            });

        if (filled($dateFrom)) {
            try {
                $from = Carbon::parse($dateFrom, 'Asia/Jakarta')->startOfDay();
                $query->where('created_at', '>=', $from);
            } catch (\Throwable $e) {
            }
        }

        if (filled($dateTo)) {
            try {
                $to = Carbon::parse($dateTo, 'Asia/Jakarta')->endOfDay();
                $query->where('created_at', '<=', $to);
            } catch (\Throwable $e) {
            }
        }

        $query
            ->search($globalSearch)
            ->orderBy($orderBy, $orderDirection)
            ->orderBy('id', $orderDirection);

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
