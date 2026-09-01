import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import olimpiades from '@/routes/admin/companies/olimpiades';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronsUpDown, Save } from 'lucide-react';
import type { FormEvent } from 'react';

type OlimpiadeRecord = {
    id: number;
    name: string;
    category: string;
    excerpt?: string | null;
    description?: string | null;
    featured_image?: string | null;
    duration?: string | null;
    level?: string | null;
    benefits?: string[] | null;
    overview_title?: string | null;
    overview_description?: string | null;
    objective_items?: { id: number }[];
    galleries?: { id: number }[];
    video_items?: { id: number }[];
    cta_description?: string | null;
    registration_url?: string | null;
    status: boolean;
    recommended: boolean;
    sort_order: number;
    event_year?: number | null;
};

const linesValue = (value?: string[] | null) => (value ?? []).join('\n');

const parseLines = (value: string) =>
    value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

const imageUrl = (value?: string | null) => {
    if (!value) {
return null;
}

    return value.startsWith('http://') || value.startsWith('https://')
        ? value
        : '/storage/' + value;
};

export const OlimpiadeForm = ({ dataId }: { dataId?: number }) => {
    const {
        olimpiade,
        objectives = [],
        galleries = [],
        videos = [],
    } = usePage<{
        olimpiade?: OlimpiadeRecord;
        objectives?: RelationOption[];
        galleries?: RelationOption[];
        videos?: RelationOption[];
    }>().props;

    const form = useForm<any>({
        name: olimpiade?.name ?? '',
        category: olimpiade?.category ?? '',
        excerpt: olimpiade?.excerpt ?? '',
        description: olimpiade?.description ?? '',
        featured_image: null,
        duration: olimpiade?.duration ?? 'Nasional',
        level: olimpiade?.level ?? 'SD - SMP',
        benefitsText: linesValue(olimpiade?.benefits),
        overview_title: olimpiade?.overview_title ?? '',
        overview_description: olimpiade?.overview_description ?? '',
        objective_ids: olimpiade?.objective_items?.map((item) => item.id) ?? [],
        gallery_ids: olimpiade?.galleries?.map((item) => item.id) ?? [],
        video_ids: olimpiade?.video_items?.map((item) => item.id) ?? [],
        cta_description: olimpiade?.cta_description ?? '',
        registration_url: olimpiade?.registration_url ?? '/kontak',
        status: olimpiade?.status ?? true,
        recommended: olimpiade?.recommended ?? false,
        sort_order: olimpiade?.sort_order ?? 0,
        event_year: olimpiade?.event_year ?? new Date().getFullYear(),
    });

    form.transform((current: any) => {
        const { benefitsText, ...payload } = current;

        return {
            ...payload,
            ...(dataId ? { _method: 'put' } : {}),
            benefits: parseLines(benefitsText),
            status: current.status ? 1 : 0,
            recommended: current.recommended ? 1 : 0,
        };
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const target = dataId
            ? olimpiades.update(dataId).url
            : olimpiades.store().url;

        form.post(target, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const error = (name: string) => {
        const message = form.errors[name];

        return message ? (
            <p className="text-sm font-medium text-destructive">{message}</p>
        ) : null;
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        {dataId ? 'Edit Olimpiade' : 'Tambah Olimpiade'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola informasi yang tampil pada halaman publik OMATIQ.
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
                <h2 className="text-lg font-semibold">Informasi utama</h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Nama" error={error('name')}>
                        <Input
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field label="Kategori" error={error('category')}>
                        <Input
                            value={form.data.category}
                            onChange={(event) =>
                                form.setData('category', event.target.value)
                            }
                            placeholder="Al-Qur'an / Matematika"
                            required
                        />
                    </Field>
                    <Field label="Durasi" error={error('duration')}>
                        <Input
                            value={form.data.duration}
                            onChange={(event) =>
                                form.setData('duration', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Jenjang" error={error('level')}>
                        <Input
                            value={form.data.level}
                            onChange={(event) =>
                                form.setData('level', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Urutan" error={error('sort_order')}>
                        <Input
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData(
                                    'sort_order',
                                    Number(event.target.value),
                                )
                            }
                        />
                    </Field>
                    <Field label="Event Tahun" error={error('event_year')}>
                        <Input
                            type="number"
                            min={2024}
                            max={2030}
                            value={form.data.event_year}
                            onChange={(event) => form.setData('event_year', Number(event.target.value))}
                            placeholder="2026"
                        />
                    </Field>
                    <Field
                        label="URL pendaftaran"
                        error={error('registration_url')}
                    >
                        <Input
                            value={form.data.registration_url}
                            onChange={(event) =>
                                form.setData(
                                    'registration_url',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </div>
                <Field label="Ringkasan" error={error('excerpt')}>
                    <Textarea
                        rows={3}
                        value={form.data.excerpt}
                        onChange={(event) =>
                            form.setData('excerpt', event.target.value)
                        }
                    />
                </Field>
                <Field label="Deskripsi" error={error('description')}>
                    <Textarea
                        rows={6}
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        required
                    />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                    <ToggleField
                        label="Aktif"
                        checked={form.data.status}
                        onChange={(checked) => form.setData('status', checked)}
                    />
                    <ToggleField
                        label="Direkomendasikan"
                        checked={form.data.recommended}
                        onChange={(checked) =>
                            form.setData('recommended', checked)
                        }
                    />
                </div>
            </Card>

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-semibold">Gambar utama</h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field
                        label="Upload gambar"
                        error={error('featured_image')}
                    >
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            required={!dataId}
                            onChange={(event) =>
                                form.setData(
                                    'featured_image',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                        />
                    </Field>
                </div>
                {imageUrl(olimpiade?.featured_image) && (
                    <img
                        src={imageUrl(olimpiade?.featured_image) ?? ''}
                        alt={olimpiade?.name}
                        className="h-44 w-full max-w-sm rounded-md object-cover"
                    />
                )}
            </Card>

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-semibold">Konten detail</h2>
                <Field
                    label="Manfaat, satu per baris"
                    error={error('benefits')}
                >
                    <Textarea
                        rows={5}
                        value={form.data.benefitsText}
                        onChange={(event) =>
                            form.setData('benefitsText', event.target.value)
                        }
                    />
                </Field>
                <Field label="Judul overview" error={error('overview_title')}>
                    <Input
                        value={form.data.overview_title}
                        onChange={(event) =>
                            form.setData('overview_title', event.target.value)
                        }
                    />
                </Field>
                <Field
                    label="Deskripsi overview"
                    error={error('overview_description')}
                >
                    <Textarea
                        rows={4}
                        value={form.data.overview_description}
                        onChange={(event) =>
                            form.setData(
                                'overview_description',
                                event.target.value,
                            )
                        }
                    />
                </Field>
                <div className="grid gap-5 lg:grid-cols-3">
                    <Field label="Objectives" error={error('objective_ids')}>
                        <RelationMultiSelect
                            options={objectives}
                            value={form.data.objective_ids}
                            onChange={(value) =>
                                form.setData('objective_ids', value)
                            }
                            placeholder="Pilih objectives"
                        />
                    </Field>
                    <Field label="Gallery" error={error('gallery_ids')}>
                        <RelationMultiSelect
                            options={galleries}
                            value={form.data.gallery_ids}
                            onChange={(value) =>
                                form.setData('gallery_ids', value)
                            }
                            placeholder="Pilih foto gallery"
                        />
                    </Field>
                    <Field label="Video" error={error('video_ids')}>
                        <RelationMultiSelect
                            options={videos}
                            value={form.data.video_ids}
                            onChange={(value) =>
                                form.setData('video_ids', value)
                            }
                            placeholder="Pilih video"
                        />
                    </Field>
                </div>
                <Field label="Deskripsi CTA" error={error('cta_description')}>
                    <Textarea
                        rows={4}
                        value={form.data.cta_description}
                        onChange={(event) =>
                            form.setData('cta_description', event.target.value)
                        }
                    />
                </Field>
            </Card>
        </form>
    );
};

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

const ToggleField = ({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) => (
    <div className="flex items-center justify-between rounded-md border p-4">
        <Label>{label}</Label>
        <Switch checked={checked} onCheckedChange={onChange} />
    </div>
);

type RelationOption = {
    id: number;
    title?: string | null;
    image_url?: string | null;
    olimpiade_id?: number | null;
};

const RelationMultiSelect = ({
    options,
    value,
    onChange,
    placeholder,
}: {
    options: RelationOption[];
    value: number[];
    onChange: (value: number[]) => void;
    placeholder: string;
}) => {
    const toggle = (id: number) =>
        onChange(
            value.includes(id)
                ? value.filter((item) => item !== id)
                : [...value, id],
        );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                >
                    {value.length
                        ? `${value.length} item dipilih`
                        : placeholder}
                    <ChevronsUpDown className="size-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="max-h-72 w-[var(--radix-popover-trigger-width)] overflow-y-auto p-2"
            >
                {options.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">
                        Belum ada data. Tambahkan melalui menu pengelolaan
                        terlebih dahulu.
                    </p>
                ) : (
                    options.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => toggle(option.id)}
                            className="flex w-full items-start gap-3 rounded-md p-2 text-left text-sm hover:bg-accent"
                        >
                            <Checkbox
                                checked={value.includes(option.id)}
                                className="mt-0.5"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">
                                    {option.title || `Gallery #${option.id}`}
                                </span>
                                {option.olimpiade_id && (
                                    <span className="block text-xs text-muted-foreground">
                                        Saat ini sudah terhubung ke olimpiade
                                        lain
                                    </span>
                                )}
                            </span>
                        </button>
                    ))
                )}
            </PopoverContent>
        </Popover>
    );
};
