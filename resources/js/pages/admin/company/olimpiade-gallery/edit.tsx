import { OlimpiadeDocumentationForm } from '@/components/forms/admin/company/olimpiade-documentation-form';
import { usePage } from '@inertiajs/react';
export default function EditPage() {
    const { item } = usePage<{ item: { id: number } }>().props;
    return (
        <div className="flex flex-1 flex-col p-4">
            <OlimpiadeDocumentationForm kind="gallery" dataId={item.id} />
        </div>
    );
}
