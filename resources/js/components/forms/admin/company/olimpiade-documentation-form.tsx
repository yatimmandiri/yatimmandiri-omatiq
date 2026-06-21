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
import galleries from '@/routes/admin/companies/olimpiade-galleries';
import objectives from '@/routes/admin/companies/olimpiade-objectives';
import videos from '@/routes/admin/companies/olimpiade-videos';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

type Kind = 'objective' | 'gallery' | 'video';
type Item = Record<string, any> & { id: number };

const configs = {
    objective: { title: 'Objective', routes: objectives },
    gallery: { title: 'Gallery', routes: galleries },
    video: { title: 'Video', routes: videos },
};

export function OlimpiadeDocumentationForm({
    kind,
    dataId,
}: {
    kind: Kind;
    dataId?: number;
}) {
    const { item, olimpiades = [] } = usePage<{
        item?: Item;
        olimpiades?: { id: number; name: string }[];
    }>().props;
    const config = configs[kind];
    const form = useForm<any>({
        olimpiade_id: item?.olimpiade_id ? String(item.olimpiade_id) : '',
        title: item?.title ?? '',
        icon: item?.icon ?? '',
        text: item?.text ?? '',
        image: null,
        image_url: item?.image_url?.startsWith('http') ? item.image_url : '',
        alt_text: item?.alt_text ?? '',
        caption: item?.caption ?? '',
        description: item?.description ?? '',
        embed_url: item?.embed_url ?? '',
        thumbnail_url: item?.thumbnail_url ?? '',
        duration: item?.duration ?? '',
        tag: item?.tag ?? '',
        sort_order: item?.sort_order ?? 0,
        status: item?.status ?? true,
    });

    form.transform((data: any) => ({
        ...data,
        ...(dataId ? { _method: 'put' } : {}),
        olimpiade_id: data.olimpiade_id || null,
        status: data.status ? 1 : 0,
    }));

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(
            dataId
                ? config.routes.update(dataId).url
                : config.routes.store().url,
            {
                forceFormData: kind === 'gallery',
                preserveScroll: true,
            },
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
                        {dataId ? 'Edit' : 'Tambah'} {config.title}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola konten dokumentasi Olimpiade OMATIQ.
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
                <Field label="Olimpiade" error={error('olimpiade_id')}>
                    <Select
                        value={form.data.olimpiade_id || '__none__'}
                        onValueChange={(value) =>
                            form.setData(
                                'olimpiade_id',
                                value === '__none__' ? '' : value,
                            )
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Belum ditugaskan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">
                                Belum ditugaskan
                            </SelectItem>
                            {olimpiades.map((olimpiade) => (
                                <SelectItem
                                    key={olimpiade.id}
                                    value={String(olimpiade.id)}
                                >
                                    {olimpiade.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                    <Field
                        label={
                            kind === 'gallery' ? 'Judul (opsional)' : 'Judul'
                        }
                        error={error('title')}
                    >
                        <Input
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                            required={kind !== 'gallery'}
                        />
                    </Field>
                    {kind === 'objective' && (
                        <Field label="Icon Lucide" error={error('icon')}>
                            <Input
                                value={form.data.icon}
                                onChange={(event) =>
                                    form.setData('icon', event.target.value)
                                }
                                placeholder="Contoh: trophy"
                            />
                        </Field>
                    )}
                    {kind === 'video' && (
                        <Field label="Tag" error={error('tag')}>
                            <Input
                                value={form.data.tag}
                                onChange={(event) =>
                                    form.setData('tag', event.target.value)
                                }
                            />
                        </Field>
                    )}
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
                </div>

                {kind === 'objective' && (
                    <Field label="Penjelasan" error={error('text')}>
                        <Textarea
                            rows={5}
                            value={form.data.text}
                            onChange={(event) =>
                                form.setData('text', event.target.value)
                            }
                            required
                        />
                    </Field>
                )}

                {kind === 'gallery' && (
                    <>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Upload gambar" error={error('image')}>
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(event) =>
                                        form.setData(
                                            'image',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Atau URL gambar"
                                error={error('image_url')}
                            >
                                <Input
                                    type="url"
                                    value={form.data.image_url}
                                    onChange={(event) =>
                                        form.setData(
                                            'image_url',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Alt text" error={error('alt_text')}>
                                <Input
                                    value={form.data.alt_text}
                                    onChange={(event) =>
                                        form.setData(
                                            'alt_text',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                        <Field label="Caption" error={error('caption')}>
                            <Textarea
                                rows={4}
                                value={form.data.caption}
                                onChange={(event) =>
                                    form.setData('caption', event.target.value)
                                }
                            />
                        </Field>
                        {item?.image_src && (
                            <img
                                src={item.image_src}
                                alt={item.alt_text || item.title || 'Gallery'}
                                className="h-48 w-full max-w-md rounded-md object-cover"
                            />
                        )}
                    </>
                )}

                {kind === 'video' && (
                    <>
                        <Field label="Embed URL" error={error('embed_url')}>
                            <Input
                                type="url"
                                value={form.data.embed_url}
                                onChange={(event) =>
                                    form.setData(
                                        'embed_url',
                                        event.target.value,
                                    )
                                }
                                placeholder="https://www.youtube.com/embed/..."
                                required
                            />
                        </Field>
                        <Field
                            label="Thumbnail URL"
                            error={error('thumbnail_url')}
                        >
                            <Input
                                type="url"
                                value={form.data.thumbnail_url}
                                onChange={(event) =>
                                    form.setData(
                                        'thumbnail_url',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Durasi" error={error('duration')}>
                                <Input
                                    value={form.data.duration}
                                    onChange={(event) =>
                                        form.setData(
                                            'duration',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="03:18"
                                />
                            </Field>
                        </div>
                        <Field label="Deskripsi" error={error('description')}>
                            <Textarea
                                rows={5}
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </>
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
