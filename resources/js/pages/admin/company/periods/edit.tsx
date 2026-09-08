import { PeriodForm } from '@/components/forms/admin/company/period-form';
import { usePage } from '@inertiajs/react';

export default function EditPage() {
    const { period } = usePage<{ period: { id: number } }>().props;

    return (
        <div className="flex flex-1 flex-col p-4">
            <PeriodForm dataId={period.id} />
        </div>
    );
}
