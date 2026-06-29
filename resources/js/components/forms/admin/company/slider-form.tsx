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
import sliders from '@/routes/admin/companies/sliders';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

type SliderRecord = {
    id: number;
    title: string;
    subtitle: string;
    featured_image?: string | null;
    featured_image_url?: string | null;
    url?: string | null;
    video_url?: string | null;
    olimpiade_id: number;
    sort_order: number;
    status: boolean;
};

export function SliderForm({ dataId }: { dataId?: number }) {
    const { slider, olimpiades = [] } = usePage<{
        slider?: SliderRecord;
        olimpiades?: { id: number; name: string; slug: string }[];
    }>().props;
    const form = useForm<any>({
        title: slider?.title ?? '',
        subtitle: slider?.subtitle ?? '',
        featured_image: null,
        url: slider?.url ?? '',
        video_url: slider?.video_url ?? '',
        olimpiade_id: slider?.olimpiade_id ? String(slider.olimpiade_id) : '',
        sort_order: slider?.sort_order ?? 0,
        status: slider?.status ?? true,
    });

    form.transform((data: any) => ({
        ...data,
        ...(dataId ? { _method: 'put' } : {}),
        status: data.status ? 1 : 0,
    }));
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(dataId ? sliders.update(dataId).url : sliders.store().url, {
            forceFormData: true,
            preserveScroll: true,
        });
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
                        {dataId ? 'Edit' : 'Tambah'} Slider
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola banner utama yang tampil pada halaman home.
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
                <h2 className="text-lg font-semibold">Konten banner</h2>
                <Field label="Judul" error={error('title')}>
                    <Input
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Subjudul" error={error('subtitle')}>
                    <Textarea
                        rows={4}
                        value={form.data.subtitle}
                        onChange={(e) =>
                            form.setData('subtitle', e.target.value)
                        }
                        required
                    />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Olimpiade" error={error('olimpiade_id')}>
                        <Select
                            value={form.data.olimpiade_id}
                            onValueChange={(value) => {
                                form.setData('olimpiade_id', value);
                                const selected = olimpiades.find(
                                    (item) => String(item.id) === value,
                                );
                                if (selected && !form.data.url)
                                    form.setData(
                                        'url',
                                        `/olimpiade/${selected.slug}`,
                                    );
                            }}
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
                    <Field label="Tautan CTA" error={error('url')}>
                        <Input
                            value={form.data.url}
                            onChange={(e) =>
                                form.setData('url', e.target.value)
                            }
                            placeholder="/olimpiade/olimpiade-matematika"
                        />
                    </Field>
                    <Field label="URL video YouTube" error={error('video_url')}>
                        <Input
                            type="url"
                            value={form.data.video_url}
                            onChange={(e) =>
                                form.setData('video_url', e.target.value)
                            }
                        />
                    </Field>
                </div>
            </Card>
            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-semibold">Media dan publikasi</h2>
                <div className="max-w-xl">
                    <Field
                        label="Upload gambar banner"
                        error={error('featured_image')}
                    >
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            required={!dataId}
                            onChange={(e) =>
                                form.setData(
                                    'featured_image',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                    </Field>
                </div>
                {slider?.featured_image_url && (
                    <img
                        src={slider.featured_image_url}
                        alt={slider.title}
                        className="aspect-[16/7] w-full max-w-2xl rounded-md object-cover"
                    />
                )}
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
