import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/teacher';
import sanggar from '@/routes/teacher/data-sanggar';
import { usePage } from '@inertiajs/react';
import { ArrowLeft, Building2, MapPin, Users } from 'lucide-react';

export default function ShowPage() {
    const { sanggar: item } = usePage<{ sanggar: Record<string, any> }>().props;
    const initial = String(item.name ?? 'S').charAt(0).toUpperCase();

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 rounded-xl"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Detail Sanggar</h1>
                    <p className="text-sm text-muted-foreground">Informasi sanggar binaan dari Penyaluran</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-[#17524A] to-[#2a8a7d] p-6 text-white shadow-sm lg:p-8">
                <div className="flex items-center gap-5">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black backdrop-blur lg:size-20">
                        {initial}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold lg:text-2xl">{item.name ?? '-'}</h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {item.type && (
                                <Badge className="rounded-full bg-white/15 px-2.5 py-1 text-white hover:bg-white/20">
                                    {item.type}
                                </Badge>
                            )}
                            {item.kantor_name && (
                                <Badge className="rounded-full bg-[#E5BE1E] px-2.5 py-1 font-bold text-[#17524A]">
                                    {item.kantor_name}
                                </Badge>
                            )}
                            <Badge className="gap-1.5 rounded-full bg-white px-2.5 py-1 font-semibold text-emerald-700">
                                <Users className="size-3.5" /> {item.total_students ?? 0} Santri
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A]">
                                <Building2 className="size-4" />
                            </span>
                            <CardTitle className="text-base">Informasi Umum</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 sm:grid-cols-2">
                        <Detail label="Nama Sanggar" value={item.name} highlight />
                        <Detail label="Tipe" value={item.type} />
                        <Detail icon={<MapPin className="size-3.5" />} label="Kantor" value={item.kantor_name} />
                        <Detail icon={<Users className="size-3.5" />} label="Total Santri" value={item.total_students != null ? `${item.total_students} Santri` : '-'} />
                        <Detail icon={<MapPin className="size-3.5" />} label="Alamat" value={item.address} className="sm:col-span-2" />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-dashed bg-muted/20 shadow-none">
                    <CardContent className="p-6">
                        <p className="text-sm font-semibold">Catatan</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            Data sanggar bersifat read-only dari Penyaluran. Untuk perubahan nama, tipe, atau alamat, silakan koordinasi dengan admin Penyaluran cabang terkait.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

ShowPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Sanggar', href: sanggar.index().url },
        { title: 'Detail Sanggar', href: '#' },
    ],
};

const Detail = ({
    label,
    value,
    className = '',
    icon,
    highlight = false,
}: {
    label: string;
    value?: any;
    className?: string;
    icon?: React.ReactNode;
    highlight?: boolean;
}) => (
    <div className={className}>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {icon}
            {label}
        </p>
        <p className={`mt-1 text-sm leading-relaxed ${highlight ? 'font-bold' : ''}`}>{value ?? '-'}</p>
    </div>
);
