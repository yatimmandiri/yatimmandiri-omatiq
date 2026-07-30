import { ParticipantForm } from '@/components/forms/admin/company/participant-form';
import { dashboard } from '@/routes/admin';
import participants from '@/routes/admin/companies/participants';
import { usePage } from '@inertiajs/react';

export default function EditPage() {
    const { participant } = usePage<{ participant: { id: number } }>().props;

    return (
        <div className="flex flex-1 flex-col p-4">
            <ParticipantForm dataId={participant.id} />
        </div>
    );
}

EditPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Peserta',
            href: participants.index().url,
        },
        {
            title: 'Edit Peserta',
            href: '#',
        },
    ],
};
