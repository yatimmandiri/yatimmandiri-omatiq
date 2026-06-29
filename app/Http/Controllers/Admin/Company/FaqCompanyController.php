<?php

namespace App\Http\Controllers\Admin\Company;

use App\Concerns\Traits\LogActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreFaqCompanyRequest;
use App\Http\Requests\Company\UpdateFaqCompanyRequest;
use App\Models\Company\FaqCompany;
use App\Models\Company\Olimpiade;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FaqCompanyController extends Controller
{
    use LogActivity;

    public function index(): Response
    {
        $this->authorize('viewAny', FaqCompany::class);

        return Inertia::render('admin/company/faq-company/list');
    }

    public function create(): Response
    {
        $this->authorize('create', FaqCompany::class);

        return Inertia::render('admin/company/faq-company/create', $this->formOptions());
    }

    public function store(StoreFaqCompanyRequest $request)
    {
        $this->authorize('create', FaqCompany::class);
        $faqCompany = FaqCompany::create($this->payload($request));
        $this->logSuccess('create-faq-company', "Created FAQ: {$faqCompany->question}", ['faq_company_id' => $faqCompany->id]);

        return redirect()->route('admin.companies.faq-companies.index')->with('success', 'FAQ Created Successfully');
    }

    public function show(FaqCompany $faqCompany): Response
    {
        $this->authorize('view', $faqCompany);

        return Inertia::render('admin/company/faq-company/show', ['faqCompany' => $faqCompany->load('olimpiade')]);
    }

    public function edit(FaqCompany $faqCompany): Response
    {
        $this->authorize('update', $faqCompany);

        return Inertia::render('admin/company/faq-company/edit', ['faqCompany' => $faqCompany, ...$this->formOptions()]);
    }

    public function update(UpdateFaqCompanyRequest $request, FaqCompany $faqCompany)
    {
        $this->authorize('update', $faqCompany);
        $faqCompany->update($this->payload($request));
        $this->logSuccess('update-faq-company', "Updated FAQ: {$faqCompany->question}", ['faq_company_id' => $faqCompany->id]);

        return redirect()->route('admin.companies.faq-companies.index')->with('success', 'FAQ Updated Successfully');
    }

    public function destroy(FaqCompany $faqCompany)
    {
        $this->authorize('delete', $faqCompany);
        $question = $faqCompany->question;
        $faqCompany->delete();
        $this->logSuccess('delete-faq-company', "Deleted FAQ: {$question}");

        return redirect()->route('admin.companies.faq-companies.index')->with('success', 'FAQ Deleted Successfully');
    }

    public function status(FaqCompany $faqCompany)
    {
        $this->authorize('update', $faqCompany);
        $faqCompany->update(['status' => ! $faqCompany->status]);

        return back()->with('success', 'FAQ Status Updated Successfully');
    }

    public function getData(Request $request)
    {
        $this->authorize('data-faq-company', FaqCompany::class);
        $allowed = ['id', 'question', 'sort_order', 'status', 'created_at', 'updated_at'];
        $orderBy = in_array($request->input('orderBy'), $allowed, true) ? $request->input('orderBy') : 'sort_order';
        $direction = strtolower((string) $request->input('orderDirection')) === 'desc' ? 'desc' : 'asc';
        $query = FaqCompany::query()->with('olimpiade:id,name')->search($request->string('globalSearch')->toString())->orderBy($orderBy, $direction)->orderBy('id');
        $data = $request->integer('perPage') ? $query->paginate($request->integer('perPage'), ['*'], 'page', $request->integer('page') ?: null) : $query->get();

        return response()->json($data);
    }

    private function payload(StoreFaqCompanyRequest|UpdateFaqCompanyRequest $request): array
    {
        $data = $request->validated();
        $data['status'] = $request->has('status') ? $request->boolean('status') : true;

        return $data;
    }

    private function formOptions(): array
    {
        return ['olimpiades' => Olimpiade::query()->active()->ordered()->get(['id', 'name'])];
    }
}
