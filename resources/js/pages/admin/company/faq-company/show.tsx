import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import faqCompanies from '@/routes/admin/companies/faq-companies';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
export default function ShowPage() {
    const { faqCompany } = usePage<{ faqCompany: Record<string, any> }>().props;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Detail FAQ</h1>
                    <p className="text-sm text-muted-foreground">
                        {faqCompany.question}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft />
                        Kembali
                    </Button>
                    <Button
                        onClick={() =>
                            router.visit(faqCompanies.edit(faqCompany.id).url)
                        }
                    >
                        <Pencil />
                        Edit
                    </Button>
                </div>
            </div>
            <Card className="max-w-3xl space-y-5 p-5">
                <Detail label="Pertanyaan" value={faqCompany.question} />
                <Detail label="Jawaban" value={faqCompany.answer} />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Detail
                        label="Olimpiade"
                        value={faqCompany.olimpiade?.name}
                    />
                    <Detail
                        label="Status"
                        value={faqCompany.status ? 'Aktif' : 'Nonaktif'}
                    />
                    <Detail label="Urutan" value={faqCompany.sort_order} />
                </div>
            </Card>
        </div>
    );
}
const Detail = ({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) => (
    <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
        </p>
        <p className="mt-1 text-sm leading-7 whitespace-pre-wrap">
            {value ?? '-'}
        </p>
    </div>
);
