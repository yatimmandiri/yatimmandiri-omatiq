import { OlimpiadeForm } from '@/components/forms/admin/company/olimpiade-form';
import { usePage } from '@inertiajs/react';

export default function EditPage() {
    const { olimpiade } = usePage<{ olimpiade: { id: number } }>().props;

    return (
        <div className="flex flex-1 flex-col p-4">
            <OlimpiadeForm dataId={olimpiade.id} />
        </div>
    );
}
