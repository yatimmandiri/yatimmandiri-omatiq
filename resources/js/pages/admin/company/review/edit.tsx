import { ReviewForm } from '@/components/forms/admin/company/review-form';
import { usePage } from '@inertiajs/react';
export default function EditPage() {
    const { review } = usePage<{ review: { id: number } }>().props;

    return (
        <div className="flex flex-1 flex-col p-4">
            <ReviewForm dataId={review.id} />
        </div>
    );
}
