import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import testimonials from '@/routes/admin/companies/testimonials';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Quote, Star } from 'lucide-react';

export default function ShowPage() {
    const { testimonial } = usePage<{ testimonial: Record<string, any> }>()
        .props;
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Detail Testimonial</h1>
                    <p className="text-sm text-muted-foreground">
                        {testimonial.name}
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
                            router.visit(testimonials.edit(testimonial.id).url)
                        }
                    >
                        <Pencil />
                        Edit
                    </Button>
                </div>
            </div>
            <Card className="max-w-3xl space-y-6 p-6">
                <div className="flex items-center gap-4">
                    {testimonial.avatar_url ? (
                        <img
                            src={testimonial.avatar_url}
                            alt={testimonial.name}
                            className="h-20 w-20 rounded-2xl object-cover"
                        />
                    ) : (
                        <div className="h-20 w-20 rounded-2xl bg-muted" />
                    )}
                    <div>
                        <h2 className="text-xl font-bold">
                            {testimonial.name}
                        </h2>
                        <p className="text-muted-foreground">
                            {testimonial.role}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: testimonial.rating }).map(
                        (_, index) => (
                            <Star key={index} className="size-5 fill-current" />
                        ),
                    )}
                </div>
                <blockquote className="relative rounded-md bg-muted p-6 text-base leading-8">
                    <Quote className="mb-3 size-6 text-primary" />
                    {testimonial.quote}
                </blockquote>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Detail
                        label="Jenis"
                        value={
                            testimonial.type === 'public_figure'
                                ? 'Review Tokoh'
                                : 'Testimonial'
                        }
                    />
                    <Detail label="Fokus" value={testimonial.focus} />
                    <Detail
                        label="Status"
                        value={testimonial.status ? 'Aktif' : 'Nonaktif'}
                    />
                    <Detail label="Urutan" value={testimonial.sort_order} />
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
        <p className="mt-1 text-sm">{value ?? '-'}</p>
    </div>
);
