import { GuestForm } from '@/components/forms/admin/company/guest-form';
import { dashboard } from '@/routes/admin';
import { Head, usePage } from '@inertiajs/react';

export default function CreateGuestPage() {
    const { suggestedCode } = usePage<any>().props;

    return (
        <>
            <Head title="Tambah Tamu Undangan" />
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <GuestForm suggestedCode={suggestedCode} />
            </div>
        </>
    );
}

CreateGuestPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tamu Undangan', href: '/admin/companies/guests' },
        { title: 'Tambah Tamu', href: '#' },
    ],
};
