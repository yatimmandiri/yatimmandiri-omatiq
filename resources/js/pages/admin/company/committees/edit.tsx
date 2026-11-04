import { CommitteeForm } from '@/components/forms/admin/company/committee-form';
import { dashboard } from '@/routes/admin';
import { Head, usePage } from '@inertiajs/react';

export default function EditCommitteePage() {
    const { committee, photoUrl, users } = usePage<any>().props;

    return (
        <>
            <Head title={`Edit Panitia: ${committee.name}`} />
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <CommitteeForm
                    committee={committee}
                    photoUrl={photoUrl}
                    users={users ?? []}
                />
            </div>
        </>
    );
}

EditCommitteePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Panitia', href: '/admin/companies/committees' },
        { title: 'Edit Panitia', href: '#' },
    ],
};
