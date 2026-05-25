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

        $data = [];

        return Inertia::render('admin/core/log-activity/list', $data);
    }

    public function getData(Request $request)
    {
        $this->authorize('data-log-activity', LogActivity::class);

        $perPage = $request->input('perPage', null);
        $page = $request->input('page', 1);
        $globalSearch = $request->input('globalSearch', '');
        $orderDirection = $request->input('orderDirection', 'desc');
        $orderBy = $request->input('orderBy', 'id');
        $filterValue = $request->input('filterValue', []);

        $query = LogActivity::query()
            ->with(['causer'])
            ->when(
                data_get($filterValue, 'filterDate'),
                function ($query, $value) {

                    $query->whereDate(
                        'created_at',
                        Carbon::parse($value)->format('Y-m-d')
                    );
                }
            )
            ->search($globalSearch)
            ->orderBy($orderBy, $orderDirection);

        $data = $perPage
            ? $query->paginate($perPage, ['*'], 'page', $page)
            : $query->get();

        return response()->json($data);
    }
}
