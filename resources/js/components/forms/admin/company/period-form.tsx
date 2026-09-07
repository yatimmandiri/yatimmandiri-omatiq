import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import periods from '@/routes/admin/companies/periods';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Save } from 'lucide-react';
import type { FormEvent } from 'react';

type PeriodRecord = {
    id: number;
    name: string;
    year: number;
    is_active: boolean;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
};

const inputDate = (value?: string | null) => value?.slice(0, 10) ?? '';

export function PeriodForm({ dataId }: { dataId?: number }) {
    const { period } = usePage<{ period?: PeriodRecord }>().props;

    const form = useForm<any>({
        name: period?.name ?? '',
        year: period?.year ?? new Date().getFullYear(),
        is_active: period?.is_active ?? false,
        description: period?.description ?? '',
        start_date: inputDate(period?.start_date),
        end_date: inputDate(period?.end_date),
    });

    form.transform((data: any) => ({
        ...data,
        ...(dataId ? { _method: 'put' } : {}),
        is_active: data.is_active ? 1 : 0,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        description: data.description || null,
    }));

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(
            dataId ? periods.update(dataId).url : periods.store().url,
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
        <form onSubmit={submit} className="mx-auto w-full max-w-4xl space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {dataId ? 'Edit Periode' : 'Tambah Periode'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola tahun event, status aktivasi, dan masa aktif olimpiade.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save className="size-4" />
                        {dataId ? 'Simpan Perubahan' : 'Simpan Periode'}
                    </Button>
                </div>
            </div>

            <Card className="space-y-6 p-6">
                <div className="flex items-center gap-2 border-b pb-4">
                    <CalendarDays className="size-5 text-primary" />
                    <h2 className="text-lg font-semibold">Informasi Periode</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Nama Periode <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Contoh: OMATIQ 2026"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                        {error('name')}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="year">
                            Tahun Event <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="year"
                            type="number"
                            min={2020}
                            max={2099}
                            placeholder="Contoh: 2026"
                            value={form.data.year}
                            onChange={(e) =>
                                form.setData('year', parseInt(e.target.value) || '')
                            }
                        />
                        {error('year')}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="start_date">Tanggal Mulai (Opsional)</Label>
                        <Input
                            id="start_date"
                            type="date"
                            value={form.data.start_date}
                            onChange={(e) => form.setData('start_date', e.target.value)}
                        />
                        {error('start_date')}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="end_date">Tanggal Selesai (Opsional)</Label>
                        <Input
                            id="end_date"
                            type="date"
                            value={form.data.end_date}
                            onChange={(e) => form.setData('end_date', e.target.value)}
                        />
                        {error('end_date')}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi / Catatan</Label>
                    <Textarea
                        id="description"
                        rows={3}
                        placeholder="Catatan tambahan seputar periode event ini..."
                        value={form.data.description}
                        onChange={(e) => form.setData('description', e.target.value)}
                    />
                    {error('description')}
                </div>

                <div className="flex items-center justify-between rounded-xl border p-4 shadow-xs">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold">
                            Periode Aktif Utama
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Jika diaktifkan, periode ini akan menjadi periode default untuk pendaftaran dan olimpiade aktif.
                        </p>
                    </div>
                    <Switch
                        checked={form.data.is_active}
                        onCheckedChange={(checked) =>
                            form.setData('is_active', checked)
                        }
                    />
                </div>
            </Card>
        </form>
    );
}
