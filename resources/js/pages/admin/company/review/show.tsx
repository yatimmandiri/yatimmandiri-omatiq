import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import reviews from '@/routes/admin/companies/reviews';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Quote, Star } from 'lucide-react';

export default function ShowPage() {
    const { review } = usePage<{ review: Record<string, any> }>()
        .props;
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Detail Review</h1>
                    <p className="text-sm text-muted-foreground">
                        {review.name}
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
                            router.visit(reviews.edit(review.id).url)
                        }
                    >
                        <Pencil />
                        Edit
                    </Button>
                </div>
            </div>
            <Card className="max-w-3xl space-y-6 p-6">
                <div className="flex items-center gap-4">
                    {review.avatar_url ? (
                        <img
                            src={review.avatar_url}
                            alt={review.name}
                            className="h-20 w-20 rounded-2xl object-cover"
                        />
                    ) : (
                        <div className="h-20 w-20 rounded-2xl bg-muted" />
                    )}
                    <div>
                        <h2 className="text-xl font-bold">
                            {review.name}
                        </h2>
                        <p className="text-muted-foreground">
                            {review.role}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: review.rating }).map(
                        (_, index) => (
                            <Star key={index} className="size-5 fill-current" />
                        ),
                    )}
                </div>
                <blockquote className="relative rounded-md bg-muted p-6 text-base leading-8">
                    <Quote className="mb-3 size-6 text-primary" />
                    {review.quote}
                </blockquote>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Detail label="Fokus" value={review.focus} />
                    <Detail
                        label="Status"
                        value={review.status ? 'Aktif' : 'Nonaktif'}
                    />
                    <Detail label="Urutan" value={review.sort_order} />
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
