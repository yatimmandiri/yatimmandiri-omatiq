import { OlimpiadeDocumentationForm } from '@/components/forms/admin/company/olimpiade-documentation-form';
export default function CreatePage() {
    return (
        <div className="flex flex-1 flex-col p-4">
            <OlimpiadeDocumentationForm kind="gallery" />
        </div>
    );
}
