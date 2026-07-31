import { FaqCompanyForm } from '@/components/forms/admin/company/faq-company-form';
import { usePage } from '@inertiajs/react';
export default function EditPage() {
    const { faqCompany } = usePage<{ faqCompany: { id: number } }>().props;

    return (
        <div className="flex flex-1 flex-col p-4">
            <FaqCompanyForm dataId={faqCompany.id} />
        </div>
    );
}
