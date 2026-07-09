import { ParticipantForm } from '@/components/forms/admin/company/participant-form';
import { usePage } from '@inertiajs/react';

export default function EditPage() {
    const { participant } = usePage<{ participant: { id: number } }>().props;

    return (
        <div className="flex flex-1 flex-col p-4">
            <ParticipantForm dataId={participant.id} />
        </div>
    );
}
