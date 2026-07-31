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
import olimpiadeSchedules from '@/routes/admin/companies/olimpiade-schedules';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent } from 'react';

type ScheduleRecord = {
    id: number;
    olimpiade_id: number;
    title: string;
    phase: string;
    start_date: string;
    end_date?: string | null;
    location?: string | null;
    description?: string | null;
    action_label?: string | null;
    action_url?: string | null;
    color?: string | null;
    sort_order: number;
    status: boolean;
};

const phases = [
    { value: 'registration', label: 'Registrasi' },
    { value: 'technical_meeting', label: 'Technical Meeting' },
    { value: 'preliminary', label: 'Babak Penyisihan' },
    { value: 'knockout', label: 'Fase Knockout' },
    { value: 'semifinal', label: 'Semifinal' },
    { value: 'final', label: 'Final Nasional' },
    { value: 'announcement', label: 'Pengumuman' },
];

const colors = ['#F15F23', '#0F60AC', '#FFC857', '#5DD39E', '#56CCF2', '#8B5CF6'];

const inputDate = (value?: string | null) => value?.slice(0, 10) ?? '';

export function OlimpiadeScheduleForm({ dataId }: { dataId?: number }) {
    const { schedule, olimpiades = [] } = usePage<{
        schedule?: ScheduleRecord;
        olimpiades?: { id: number; name: string; slug: string }[];
    }>().props;

    const form = useForm<any>({
        olimpiade_id: schedule?.olimpiade_id ? String(schedule.olimpiade_id) : '',
        title: schedule?.title ?? '',
        phase: schedule?.phase ?? 'registration',
        start_date: inputDate(schedule?.start_date),
        end_date: inputDate(schedule?.end_date),
        location: schedule?.location ?? '',
        description: schedule?.description ?? '',
        action_label: schedule?.action_label ?? '',
        action_url: schedule?.action_url ?? '',
        color: schedule?.color ?? '#F15F23',
        sort_order: schedule?.sort_order ?? 0,
        status: schedule?.status ?? true,
    });

    form.transform((data: any) => ({
        ...data,
        ...(dataId ? { _method: 'put' } : {}),
        status: data.status ? 1 : 0,
        end_date: data.end_date || null,
    }));

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(
            dataId
                ? olimpiadeSchedules.update(dataId).url
                : olimpiadeSchedules.store().url,
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
                        {dataId ? 'Edit' : 'Tambah'} Jadwal Olimpiade
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola timeline registrasi, knockout, sampai final.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
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
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Olimpiade" error={error('olimpiade_id')}>
                        <Select
                            value={form.data.olimpiade_id}
                            onValueChange={(value) => form.setData('olimpiade_id', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih olimpiade" />
                            </SelectTrigger>
                            <SelectContent>
                                {olimpiades.map((item) => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Fase" error={error('phase')}>
                        <Select
                            value={form.data.phase}
                            onValueChange={(value) => form.setData('phase', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih fase" />
                            </SelectTrigger>
                            <SelectContent>
                                {phases.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <Field label="Judul Jadwal" error={error('title')}>
                    <Input
                        value={form.data.title}
                        onChange={(event) => form.setData('title', event.target.value)}
                        placeholder="Registrasi Gelombang Nasional"
                        required
                    />
                </Field>

                <div className="grid gap-5 md:grid-cols-3">
                    <Field label="Tanggal Mulai" error={error('start_date')}>
                        <Input
                            type="date"
                            value={form.data.start_date}
                            onChange={(event) => form.setData('start_date', event.target.value)}
                            required
                        />
                    </Field>
                    <Field label="Tanggal Selesai" error={error('end_date')}>
                        <Input
                            type="date"
                            value={form.data.end_date}
                            onChange={(event) => form.setData('end_date', event.target.value)}
                        />
                    </Field>
                    <Field label="Urutan" error={error('sort_order')}>
                        <Input
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) => form.setData('sort_order', Number(event.target.value))}
                        />
                    </Field>
                </div>

                <Field label="Lokasi / Mode" error={error('location')}>
                    <Input
                        value={form.data.location}
                        onChange={(event) => form.setData('location', event.target.value)}
                        placeholder="Online Nasional / Kota Final"
                    />
                </Field>

                <Field label="Deskripsi" error={error('description')}>
                    <Textarea
                        rows={5}
                        value={form.data.description}
                        onChange={(event) => form.setData('description', event.target.value)}
                        placeholder="Ringkasan aktivitas dan hal yang perlu disiapkan peserta."
                    />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Label CTA" error={error('action_label')}>
                        <Input
                            value={form.data.action_label}
                            onChange={(event) => form.setData('action_label', event.target.value)}
                            placeholder="Daftar Sekarang"
                        />
                    </Field>
                    <Field label="URL CTA" error={error('action_url')}>
                        <Input
                            value={form.data.action_url}
                            onChange={(event) => form.setData('action_url', event.target.value)}
                            placeholder="/kontak"
                        />
                    </Field>
                </div>

                <Field label="Warna Fase" error={error('color')}>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => form.setData('color', color)}
                                className={`h-10 w-10 rounded-xl ring-offset-2 transition ${form.data.color === color ? 'ring-2 ring-slate-900' : 'ring-1 ring-slate-200'}`}
                                style={{ backgroundColor: color }}
                                aria-label={`Pilih warna ${color}`}
                            />
                        ))}
                    </div>
                </Field>

                <div className="flex items-center justify-between rounded-md border p-4">
                    <Label>Status aktif</Label>
                    <Switch
                        checked={form.data.status}
                        onCheckedChange={(checked) => form.setData('status', checked)}
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
