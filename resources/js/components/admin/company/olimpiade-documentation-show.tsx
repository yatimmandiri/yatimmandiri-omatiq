import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import galleries from '@/routes/admin/companies/olimpiade-galleries';
import objectives from '@/routes/admin/companies/olimpiade-objectives';
import videos from '@/routes/admin/companies/olimpiade-videos';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

type Kind = 'objective' | 'gallery' | 'video';
const configs = {
    objective: { title: 'Objective', routes: objectives },
    gallery: { title: 'Gallery', routes: galleries },
    video: { title: 'Video', routes: videos },
};

export function OlimpiadeDocumentationShow({ kind }: { kind: Kind }) {
    const { item } = usePage<{ item: Record<string, any> }>().props;
    const config = configs[kind];

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Detail {config.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {item.title || 'Dokumentasi Olimpiade'}
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
                            router.visit(config.routes.edit(item.id).url)
                        }
                    >
                        <Pencil />
                        Edit
                    </Button>
                </div>
            </div>
            <Card className="space-y-5 p-5">
                {kind === 'gallery' && (
                    <img
                        src={item.image_src}
                        alt={item.alt_text || item.title || 'Gallery'}
                        className="max-h-[28rem] w-full rounded-md object-cover"
                    />
                )}
                {kind === 'video' && (
                    <div className="aspect-video overflow-hidden rounded-md bg-muted">
                        <iframe
                            src={item.embed_url}
                            title={item.title}
                            className="h-full w-full"
                            allowFullScreen
                        />
                    </div>
                )}
                <Detail label="Judul" value={item.title} />
                <Detail
                    label="Olimpiade"
                    value={item.olimpiade?.name || 'Belum ditugaskan'}
                />
                {kind === 'objective' && (
                    <>
                        <Detail label="Icon" value={item.icon} />
                        <Detail label="Penjelasan" value={item.text} />
                    </>
                )}
                {kind === 'gallery' && (
                    <>
                        <Detail label="Alt text" value={item.alt_text} />
                        <Detail label="Caption" value={item.caption} />
                    </>
                )}
                {kind === 'video' && (
                    <>
                        <Detail label="Deskripsi" value={item.description} />
                        <Detail label="Durasi" value={item.duration} />
                        <Detail label="Tag" value={item.tag} />
                    </>
                )}
                <Detail
                    label="Status"
                    value={item.status ? 'Aktif' : 'Nonaktif'}
                />
                <Detail label="Urutan" value={item.sort_order} />
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
