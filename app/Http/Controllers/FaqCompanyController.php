<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreFaqCompanyRequest;
use App\Http\Requests\Company\UpdateFaqCompanyRequest;
use App\Models\Company\CategoryFaqCompany;
use App\Models\Company\FaqCompany;
use App\Models\Company\Olimpiade;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqCompanyController extends Controller
{
    use LogActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', FaqCompany::class);

        $data = [];

        return Inertia::render('admin/company/faqs/list', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', FaqCompany::class);

        $olimpiade = Olimpiade::query()->get();

        $data = [
            'olimpiade' => $olimpiade,
        ];

        return Inertia::render('admin/company/faqs/create', $data);
    }

    /**
     * Store a newly Created resource in storage.
     */
    public function store(StoreFaqCompanyRequest $request)
    {
        $this->authorize('create', FaqCompany::class);

        $data = [
            'question' => $request->question,
            'answer' => $request->answer,
            'olimpiade_id' => $request->olimpiade_id
        ];

        $faq = FaqCompany::create($data);

        if ($faq) {
            $this->logSuccess('create-faq', "Created faq: {$faq->name}", [
                'faq_id' => $faq->id,
                'new_data' => $faq->toArray(),
            ]);
        } else {
            $this->logError('create-faq', "Failed to create faq: {$faq->name}", [
                'faq_id' => $faq->id,
                'new_data' => $faq->toArray(),
            ]);
        }

        return redirect()->route('admin.companies.faq-companies.index')->with('success', 'Category Created Successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(FaqCompany $faq_company)
    {
        $this->authorize('view', $faq_company);

        $faq_company->load(['olimpiades']);

        $data = [
            'faq' => $faq_company,
        ];

        return Inertia::render('admin/company/faqs/show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FaqCompany $faq_company)
    {
        $this->authorize('update', $faq_company);

        $olimpiade = Olimpiade::query()->get();

        $faq_company->load(['olimpiades']);

        $data = [
            'faq' => $faq_company,
            'olimpiade' => $olimpiade,
        ];

        return Inertia::render('admin/company/faqs/edit', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFaqCompanyRequest $request, FaqCompany $faq_company)
    {
        $this->authorize('update', $faq_company);

        $data = $request->only(['question', 'answer', 'olimpiade_id']);

        $oldData = $faq_company->replicate();

        $faq_company->update($data);

        if ($faq_company) {
            $this->logSuccess('update-faq', "Updated Faq: {$faq_company->name}", [
                'faq_id' => $faq_company->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $faq_company->toArray(),
            ]);
        } else {
            $this->logError('update-faq', "Failed to create faq: {$faq_company->name}", [
                'faq_id' => $faq_company->id,
                'old_data' => $oldData->toArray(),
                'new_data' => $faq_company->toArray(),
            ]);
        }

        return redirect()->route('admin.companies.faq-companies.index')->with('success', 'Category Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FaqCompany $faq_company)
    {
        $this->authorize('delete', $faq_company);

        $faq_company->delete();

        if ($faq_company) {
            $this->logSuccess('delete-faq', "Delete Faq: {$faq_company->name}", ['faq_id' => $faq_company->id]);
        } else {
            $this->logError('delete-faq', "Failed to delete Faq: {$faq_company->name}", ['faq_id' => $faq_company->id]);
        }

        return redirect()->route('admin.companies.faq-companies.index')->with('success', 'Category Deleted Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-faq-company', FaqCompany::class);

        $perPage = $request->input('perPage', null);
        $page = $request->input('page', null);
        $globalSearch = $request->input('globalSearch', '');
        $orderBy = $request->input('orderBy', 'id');
        $orderDirection = $request->input('orderDirection', 'desc');

        $query = FaqCompany::query()
            ->with(['olimpiades'])
            ->search($globalSearch)
            ->orderBy($orderBy, $orderDirection);

        $data = $perPage
            ? $query->paginate($perPage, ['*'], 'page', $page)
            : $query->get();

        return response()->json($data);
    }
}
