import { TestimonialForm } from '@/components/forms/admin/company/testimonial-form';
import { usePage } from '@inertiajs/react';
export default function EditPage() {
    const { testimonial } = usePage<{ testimonial: { id: number } }>().props;
    return (
        <div className="flex flex-1 flex-col p-4">
            <TestimonialForm dataId={testimonial.id} />
        </div>
    );
}
