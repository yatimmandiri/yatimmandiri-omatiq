import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import faqCompanies from '@/routes/admin/companies/faq-companies';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

type FaqRecord = {
    id: number;
    question: string;
    answer: string;
    olimpiade_id: number;
    sort_order: number;
    status: boolean;
};

export function FaqCompanyForm({ dataId }: { dataId?: number }) {
    const { faqCompany, olimpiades = [] } = usePage<{
        faqCompany?: FaqRecord;
        olimpiades?: { id: number; name: string }[];
    }>().props;
    const form = useForm<any>({
        question: faqCompany?.question ?? '',
        answer: faqCompany?.answer ?? '',
        olimpiade_id: faqCompany?.olimpiade_id
            ? String(faqCompany.olimpiade_id)
            : '',
        sort_order: faqCompany?.sort_order ?? 0,
        status: faqCompany?.status ?? true,
    });
    form.transform((data: any) => ({
        ...data,
        ...(dataId ? { _method: 'put' } : {}),
        status: data.status ? 1 : 0,
    }));
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(
            dataId ? faqCompanies.update(dataId).url : faqCompanies.store().url,
            { preserveScroll: true },
        );
    };
    const error = (name: string) =>
        form.errors[name] ? (
            <p className="text-sm font-medium text-destructive">
                {form.errors[name]}
            </p>
        ) : null;

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        {dataId ? 'Edit' : 'Tambah'} FAQ
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola pertanyaan yang sering diajukan tentang OMATIQ.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft />
                        Kembali
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save />
                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </div>
            <Card className="space-y-5 p-5">
                <Field label="Pertanyaan" error={error('question')}>
                    <Input
                        value={form.data.question}
                        onChange={(e) =>
                            form.setData('question', e.target.value)
                        }
                        required
                    />
                </Field>
                <Field label="Jawaban" error={error('answer')}>
                    <Textarea
                        rows={7}
                        value={form.data.answer}
                        onChange={(e) => form.setData('answer', e.target.value)}
                        required
                    />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field
                        label="Olimpiade terkait"
                        error={error('olimpiade_id')}
                    >
                        <Select
                            value={form.data.olimpiade_id}
                            onValueChange={(value) =>
                                form.setData('olimpiade_id', value)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih olimpiade" />
                            </SelectTrigger>
                            <SelectContent>
                                {olimpiades.map((item) => (
                                    <SelectItem
                                        key={item.id}
                                        value={String(item.id)}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Urutan" error={error('sort_order')}>
                        <Input
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(e) =>
                                form.setData(
                                    'sort_order',
                                    Number(e.target.value),
                                )
                            }
                        />
                    </Field>
                </div>
                <div className="flex items-center justify-between rounded-md border p-4">
                    <Label>Status aktif</Label>
                    <Switch
                        checked={form.data.status}
                        onCheckedChange={(checked) =>
                            form.setData('status', checked)
                        }
                    />
                </div>
            </Card>
        </form>
    );
}

const Field = ({
    label,
    children,
    error,
}: {
    label: string;
    children: React.ReactNode;
    error?: React.ReactNode;
}) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        {children}
        {error}
    </div>
);
