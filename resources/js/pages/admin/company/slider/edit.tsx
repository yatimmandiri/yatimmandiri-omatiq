import { SliderForm } from '@/components/forms/admin/company/slider-form';
import { usePage } from '@inertiajs/react';
export default function EditPage() {
    const { slider } = usePage<{ slider: { id: number } }>().props;
    return (
        <div className="flex flex-1 flex-col p-4">
            <SliderForm dataId={slider.id} />
        </div>
    );
}
