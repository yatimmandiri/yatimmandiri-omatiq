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
import reviews from '@/routes/admin/companies/reviews';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { FormEvent } from 'react';

type ReviewRecord = {
    id: number;
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

export function ReviewForm({ dataId }: { dataId?: number }) {
    const { review } = usePage<{ review?: ReviewRecord }>().props;
    const form = useForm<any>({
        name: review?.name ?? '',
        role: review?.role ?? '',
        quote: review?.quote ?? '',
        avatar_file: null,
        rating: review?.rating ?? 5,
        focus: review?.focus ?? '',
        sort_order: review?.sort_order ?? 0,
        status: review?.status ?? true,
    });

    form.transform((data: any) => ({
        ...data,
        ...(dataId ? { _method: 'put' } : {}),
        status: data.status ? 1 : 0,
    }));

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(dataId ? reviews.update(dataId).url : reviews.store().url, {
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
                        {dataId ? 'Edit' : 'Tambah'} Review
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola review dan review tokoh yang tampil pada halaman
                        home.
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
                <div className="max-w-xl">
                    <Field label="Upload avatar" error={error('avatar_file')}>
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            required={!dataId}
                            onChange={(event) =>
                                form.setData(
                                    'avatar_file',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                        />
                    </Field>
                </div>
                {review?.avatar_url && (
                    <img
                        src={review.avatar_url}
                        alt={review.name}
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
