import { CommitteeForm } from '@/components/forms/admin/company/committee-form';
import { dashboard } from '@/routes/admin';
import { Head, usePage } from '@inertiajs/react';

export default function CreateCommitteePage() {
    const { users, suggestedCode } = usePage<any>().props;

    return (
        <>
            <Head title="Tambah Panitia Pelaksana" />
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <CommitteeForm
                    users={users ?? []}
                    suggestedCode={suggestedCode}
                />
            </div>
        </>
    );
}

CreateCommitteePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Panitia', href: '/admin/companies/committees' },
        { title: 'Tambah Panitia', href: '#' },
    ],
};
