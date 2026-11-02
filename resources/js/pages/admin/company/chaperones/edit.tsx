import { ChaperoneForm } from '@/components/forms/admin/company/chaperone-form';
import { dashboard } from '@/routes/admin';
import chaperones from '@/routes/admin/companies/chaperones';
import { Head, usePage } from '@inertiajs/react';

export default function EditChaperonePage() {
    const {
        chaperone,
        selectedParticipantIds,
        isCabang,
        teachers,
        participants,
        provinces,
    } = usePage<any>().props;

    return (
        <>
            <Head title={`Edit Pendamping - ${chaperone?.name ?? ''}`} />
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <ChaperoneForm
                    initialData={chaperone}
                    selectedParticipantIds={selectedParticipantIds ?? []}
                    isCabang={isCabang}
                    defaultBranch={chaperone?.branch ?? ''}
                    teachers={teachers ?? []}
                    participants={participants ?? []}
                    provinces={provinces ?? []}
                    isEdit
                />
            </div>
        </>
    );
}

EditChaperonePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Pendamping', href: chaperones.index().url },
        { title: 'Edit Pendamping', href: '#' },
    ],
};
