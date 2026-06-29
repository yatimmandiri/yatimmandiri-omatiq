import { OlimpiadeScheduleForm } from '@/components/forms/admin/company/olimpiade-schedule-form';
import { usePage } from '@inertiajs/react';

export default function EditPage() {
    const { schedule } = usePage<{ schedule: { id: number } }>().props;

    return (
        <div className="flex flex-1 flex-col p-4">
            <OlimpiadeScheduleForm dataId={schedule.id} />
        </div>
    );
}
