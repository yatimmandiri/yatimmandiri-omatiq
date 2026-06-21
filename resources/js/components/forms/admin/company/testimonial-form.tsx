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
import testimonials from '@/routes/admin/companies/testimonials';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { FormEvent } from 'react';

type TestimonialRecord = {
    id: number;
    type: 'testimonial' | 'public_figure';
    name: string;
    role: string;
    quote: string;
    avatar?: string | null;
    avatar_url?: string | null;
    rating: number;
    focus?: string | null;
    sort_order: number;
    status: boolean;
};

export function TestimonialForm({ dataId }: { dataId?: number }) {
    const { testimonial } = usePage<{ testimonial?: TestimonialRecord }>()
        .props;
    const form = useForm<any>({
        type: testimonial?.type ?? 'testimonial',
        name: testimonial?.name ?? '',
        role: testimonial?.role ?? '',
        quote: testimonial?.quote ?? '',
        avatar_file: null,
        avatar_url: testimonial?.avatar?.startsWith('http')
            ? testimonial.avatar
            : '',
        rating: testimonial?.rating ?? 5,
        focus: testimonial?.focus ?? '',
        sort_order: testimonial?.sort_order ?? 0,
        status: testimonial?.status ?? true,
    });

    form.transform((data: any) => ({
        ...data,
        ...(dataId ? { _method: 'put' } : {}),
        status: data.status ? 1 : 0,
    }));

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(
            dataId ? testimonials.update(dataId).url : testimonials.store().url,
            {
                forceFormData: true,
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
                        {dataId ? 'Edit' : 'Tambah'} Testimonial
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola testimonial dan review tokoh yang tampil pada
                        halaman home.
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
                <h2 className="text-lg font-semibold">
                    Informasi pemberi ulasan
                </h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Jenis" error={error('type')}>
                        <Select
                            value={form.data.type}
                            onValueChange={(value) =>
                                form.setData('type', value)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="testimonial">
                                    Testimonial Peserta / Pendamping
                                </SelectItem>
                                <SelectItem value="public_figure">
                                    Review Tokoh
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Nama" error={error('name')}>
                        <Input
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field label="Peran / Jabatan" error={error('role')}>
                        <Input
                            value={form.data.role}
                            onChange={(event) =>
                                form.setData('role', event.target.value)
                            }
                            required
                        />
                    </Field>
                    {form.data.type === 'public_figure' && (
                        <Field label="Fokus / Keahlian" error={error('focus')}>
                            <Input
                                value={form.data.focus}
                                onChange={(event) =>
                                    form.setData('focus', event.target.value)
                                }
                                placeholder="Contoh: Pendidikan Karakter"
                                required
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
                <Field label="Isi ulasan" error={error('quote')}>
                    <Textarea
                        rows={6}
                        maxLength={2000}
                        value={form.data.quote}
                        onChange={(event) =>
                            form.setData('quote', event.target.value)
                        }
                        required
                    />
                </Field>
            </Card>

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-semibold">Foto dan penilaian</h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Upload avatar" error={error('avatar_file')}>
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) =>
                                form.setData(
                                    'avatar_file',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                        />
                    </Field>
                    <Field label="Atau URL avatar" error={error('avatar_url')}>
                        <Input
                            type="url"
                            value={form.data.avatar_url}
                            onChange={(event) =>
                                form.setData('avatar_url', event.target.value)
                            }
                        />
                    </Field>
                </div>
                {testimonial?.avatar_url && (
                    <img
                        src={testimonial.avatar_url}
                        alt={testimonial.name}
                        className="h-28 w-28 rounded-2xl object-cover"
                    />
                )}
                <Field label="Rating" error={error('rating')}>
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                                key={rating}
                                type="button"
                                variant={
                                    form.data.rating === rating
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => form.setData('rating', rating)}
                            >
                                {rating}
                                <Star
                                    className={
                                        form.data.rating >= rating
                                            ? 'fill-current'
                                            : ''
                                    }
                                />
                            </Button>
                        ))}
                    </div>
                </Field>
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
