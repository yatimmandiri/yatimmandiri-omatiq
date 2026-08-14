import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import olimpiades from '@/routes/admin/companies/olimpiades';
import { formatDate } from '@/utils/formatDate';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function ShowPage() {
    const { olimpiade } = usePage<any>().props;
    const image =
        olimpiade.featured_image?.startsWith('http') === true
            ? olimpiade.featured_image
            : olimpiade.featured_image
              ? '/storage/' + olimpiade.featured_image
              : null;

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{olimpiade.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {olimpiade.slug}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={olimpiades.index().url}>
                            <ArrowLeft />
                            Kembali
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={olimpiades.edit(olimpiade.id).url}>
                            <Pencil />
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                <Card className="space-y-5 p-5">
                    {image && (
                        <img
                            src={image}
                            alt={olimpiade.name}
                            className="aspect-video w-full rounded-md object-cover"
                        />
                    )}
                    <div className="flex flex-wrap gap-2">
                        <Badge>{olimpiade.category}</Badge>
                        <Badge
                            variant={olimpiade.status ? 'default' : 'secondary'}
                        >
                            {olimpiade.status ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                        {olimpiade.recommended && (
                            <Badge variant="outline">Direkomendasikan</Badge>
                        )}
                        {olimpiade.show_on_registration && (
                            <Badge variant="secondary">Tampil di Form</Badge>
                        )}
                    </div>
                    <Detail label="Durasi" value={olimpiade.duration} />
                    <Detail label="Jenjang" value={olimpiade.level} />
                    <Detail label="Urutan" value={olimpiade.sort_order} />
                    <Detail
                        label="Dibuat"
                        value={formatDate(olimpiade.created_at)}
                    />
                    <Detail
                        label="Diperbarui"
                        value={formatDate(olimpiade.updated_at)}
                    />
                </Card>

                <div className="space-y-6">
                    <Card className="space-y-5 p-5">
                        <h2 className="text-lg font-semibold">Konten utama</h2>
                        <Detail label="Ringkasan" value={olimpiade.excerpt} />
                        <Detail
                            label="Deskripsi"
                            value={olimpiade.description}
                        />
                        <Detail
                            label="Overview"
                            value={olimpiade.overview_title}
                        />
                        <Detail
                            label="Deskripsi overview"
                            value={olimpiade.overview_description}
                        />
                        <Detail label="CTA" value={olimpiade.cta_description} />
                    </Card>

                    <Card className="space-y-5 p-5">
                        <h2 className="text-lg font-semibold">
                            Struktur dokumentasi
                        </h2>
                        <JsonBlock label="Manfaat" value={olimpiade.benefits} />
                        <JsonBlock
                            label="Objectives"
                            value={olimpiade.objective_items}
                        />
                        <JsonBlock label="Galeri" value={olimpiade.galleries} />
                        <JsonBlock
                            label="Video"
                            value={olimpiade.video_items}
                        />
                    </Card>
                </div>
            </div>
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
        <p className="mt-1 text-sm whitespace-pre-wrap">{value || '-'}</p>
    </div>
);

const JsonBlock = ({ label, value }: { label: string; value: unknown }) => (
    <div>
        <p className="mb-2 text-sm font-semibold">{label}</p>
        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-4 text-xs">
            {JSON.stringify(value ?? [], null, 2)}
        </pre>
    </div>
);
