import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/teacher';
import binaanRoute from '@/routes/teacher/data-binaan';
import sanggar from '@/routes/teacher/data-sanggar';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Building2, MapPin, Users, UserRound } from 'lucide-react';

export default function ShowPage() {
    const { sanggar: item } = usePage<{ sanggar: Record<string, any> }>().props;
    const initial = String(item.name ?? 'S')
        .charAt(0)
        .toUpperCase();

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit(sanggar.index().url);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Kembali"
                        className="size-9 shrink-0 rounded-xl"
                        onClick={goBack}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
                            Detail Sanggar
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Informasi sanggar binaan — sinkron langsung dari
                            Penyaluran
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(sanggar.index().url)}
                        className="gap-2"
                    >
                        <Building2 className="size-4" />
                        Semua Sanggar
                    </Button>
                    <Button
                        onClick={() =>
                            router.visit(
                                binaanRoute.index({
                                    query: item.id
                                        ? { sanggar_id: String(item.id) }
                                        : undefined,
                                }).url,
                            )
                        }
                        className="gap-2 bg-[#17524A] text-white hover:bg-[#12423b]"
                    >
                        <UserRound className="size-4" />
                        Lihat Binaan
                    </Button>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#17524A] via-[#1e6a5e] to-[#2a8a7d] p-6 text-white shadow-sm lg:p-8">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-20 -left-12 size-64 rounded-full bg-[#E5BE1E]/15 blur-3xl"
                />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black backdrop-blur lg:size-20 lg:text-2xl">
                        {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-xl font-bold lg:text-2xl">
                            {item.name ?? '-'}
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                            <MapPin className="size-3.5 shrink-0 opacity-70" />
                            <span className="truncate">
                                {item.address ??
                                    item.kantor_name ??
                                    'Alamat belum tersedia'}
                            </span>
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {item.type && (
                                <Badge className="rounded-full bg-white/15 px-2.5 py-1 text-white hover:bg-white/20">
                                    {item.type}
                                </Badge>
                            )}
                            {item.kantor_name && (
                                <Badge className="rounded-full bg-[#E5BE1E] px-2.5 py-1 font-bold text-[#17524A] hover:bg-[#E5BE1E]">
                                    {item.kantor_name}
                                </Badge>
                            )}
                            <Badge className="gap-1.5 rounded-full bg-white px-2.5 py-1 font-semibold text-emerald-700 hover:bg-white">
                                <Users className="size-3.5" />{' '}
                                {item.total_students ?? 0} Santri
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A] dark:text-emerald-300">
                                <Building2 className="size-4" />
                            </span>
                            <div>
                                <CardTitle className="text-base">
                                    Informasi Umum
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Sumber: Penyaluran API — read-only di OMATIQ
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 sm:grid-cols-2">
                        <Detail
                            label="Nama Sanggar"
                            value={item.name}
                            highlight
                        />
                        <Detail label="Tipe" value={item.type} />
                        <Detail
                            icon={<MapPin className="size-3.5" />}
                            label="Kantor"
                            value={item.kantor_name}
                        />
                        <Detail
                            icon={<Users className="size-3.5" />}
                            label="Total Santri"
                            value={
                                item.total_students != null
                                    ? `${item.total_students} Santri`
                                    : '-'
                            }
                        />
                        <Detail label="ID Sanggar" value={item.id} mono />
                        <Detail
                            icon={<MapPin className="size-3.5" />}
                            label="Alamat"
                            value={item.address}
                            className="sm:col-span-2"
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="size-4 text-[#17524A]" />
                                Ringkasan Binaan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                                <span className="text-sm text-muted-foreground">
                                    Total santri terbina
                                </span>
                                <span className="text-lg font-black text-[#17524A] dark:text-emerald-300">
                                    {item.total_students ?? 0}
                                </span>
                            </div>
                            <Button
                                className="w-full gap-2 bg-[#17524A] text-white hover:bg-[#12423b]"
                                onClick={() =>
                                    router.visit(
                                        binaanRoute.index({
                                            query: item.id
                                                ? {
                                                      sanggar_id: String(
                                                          item.id,
                                                      ),
                                                  }
                                                : undefined,
                                        }).url,
                                    )
                                }
                            >
                                <UserRound className="size-4" />
                                Kelola Binaan Sanggar Ini
                            </Button>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Pendaftaran OMATIQ selalu dimulai dari Data
                                Binaan — pilih santri lalu klik Daftarkan.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-dashed bg-muted/20 shadow-none">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Catatan
                            </p>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                Data sanggar bersifat read-only dari Penyaluran.
                                Untuk perubahan nama, tipe, atau alamat, silakan
                                koordinasi dengan admin Penyaluran cabang
                                terkait.
                            </p>
                        </CardContent>
                    </Card>
                </div>
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
    mono = false,
}: {
    label: string;
    value?: any;
    className?: string;
    icon?: React.ReactNode;
    highlight?: boolean;
    mono?: boolean;
}) => (
    <div className={className}>
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {icon}
            {label}
        </p>
        <p
            className={`mt-1 text-sm leading-relaxed break-words whitespace-pre-wrap ${highlight ? 'font-bold' : ''} ${mono ? 'font-mono' : ''}`}
        >
            {value ?? '-'}
        </p>
    </div>
);
