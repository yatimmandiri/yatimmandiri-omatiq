import { ChaperoneForm } from '@/components/forms/admin/company/chaperone-form';
import { dashboard } from '@/routes/admin';
import chaperones from '@/routes/admin/companies/chaperones';
import { Head, usePage } from '@inertiajs/react';

export default function CreateChaperonePage() {
    const { isCabang, defaultBranch, teachers, participants, provinces } = usePage<any>().props;

    return (
        <>
            <Head title="Daftarkan Pendamping Babak Nasional" />
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <ChaperoneForm
                    isCabang={isCabang}
                    defaultBranch={defaultBranch}
                    teachers={teachers ?? []}
                    participants={participants ?? []}
                    provinces={provinces ?? []}
                />
            </div>
        </>
    );
}

CreateChaperonePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Pendamping', href: chaperones.index().url },
        { title: 'Daftarkan Pendamping', href: '#' },
    ],
};
