import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import sliders from '@/routes/admin/companies/sliders';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
export default function ShowPage() {
    const { slider } = usePage<{ slider: Record<string, any> }>().props;
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Detail Slider</h1>
                    <p className="text-sm text-muted-foreground">
                        {slider.title}
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
                            router.visit(sliders.edit(slider.id).url)
                        }
                    >
                        <Pencil />
                        Edit
                    </Button>
                </div>
            </div>
            <Card className="max-w-4xl space-y-5 p-5">
                {slider.featured_image_url && (
                    <img
                        src={slider.featured_image_url}
                        alt={slider.title}
                        className="aspect-[16/7] w-full rounded-md object-cover"
                    />
                )}
                <Detail label="Judul" value={slider.title} />
                <Detail label="Subjudul" value={slider.subtitle} />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Detail label="Olimpiade" value={slider.olimpiade?.name} />
                    <Detail label="Tautan CTA" value={slider.url} />
                    <Detail label="URL Video" value={slider.video_url} />
                    <Detail
                        label="Status"
                        value={slider.status ? 'Aktif' : 'Nonaktif'}
                    />
                    <Detail label="Urutan" value={slider.sort_order} />
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
        <p className="mt-1 text-sm whitespace-pre-wrap">{value ?? '-'}</p>
    </div>
);
