import { GuestForm } from '@/components/forms/admin/company/guest-form';
import { dashboard } from '@/routes/admin';
import { Head, usePage } from '@inertiajs/react';

export default function EditGuestPage() {
    const { guest, photoUrl } = usePage<any>().props;

    return (
        <>
            <Head title={`Edit Tamu: ${guest.name}`} />
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <GuestForm guest={guest} photoUrl={photoUrl} />
            </div>
        </>
    );
}

EditGuestPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Tamu Undangan', href: '/admin/companies/guests' },
        { title: 'Edit Tamu', href: '#' },
    ],
};
