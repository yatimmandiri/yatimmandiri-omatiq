import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import binaanRoute from '@/routes/admin/guru/data-binaan';
import dataPeserta from '@/routes/admin/guru/data-peserta';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock3, Eye, RefreshCcw, UserPlus, XCircle } from 'lucide-react';

export default function ShowPage() {
    const { binaan, registration } = usePage<{ binaan: Record<string, any>; registration?: Record<string, any> | null }>().props;

    const fullName = binaan.full_name ?? binaan.name ?? '-';
    const isRegistered = !!binaan.is_registered;
    const status = binaan.registration_status ?? registration?.status ?? null;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Detail Binaan</h1>
                    <p className="text-sm text-muted-foreground">
                        {fullName} — {binaan.nik ?? '-'}
                        {binaan.sanggar_names?.length ? ` • ${binaan.sanggar_names.join(', ')}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Button>
                    {!isRegistered || status === 'rejected' ? (
                        <Button
                            onClick={() =>
                                router.visit(
                                    dataPeserta.create({
                                        query: {
                                            student_id: String(binaan.student_id ?? binaan.id),
                                            ...(binaan.sanggar_ids?.[0]
                                                ? { sanggar_id: String(binaan.sanggar_ids[0]) }
                                                : binaan.sanggar_id
                                                  ? { sanggar_id: String(binaan.sanggar_id) }
                                                  : {}),
                                        },
                                    }).url,
                                )
                            }
                        >
                            {status === 'rejected' ? <RefreshCcw className="size-4" /> : <UserPlus className="size-4" />}
                            {status === 'rejected' ? 'Daftarkan Ulang' : 'Daftarkan'}
                        </Button>
                    ) : (
                        registration?.id && (
                            <Button variant="outline" onClick={() => router.visit(dataPeserta.show(registration.id).url)}>
                                <Eye className="size-4" />
                                Detail Pendaftaran
                            </Button>
                        )
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="space-y-4 p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold">Biodata Binaan (Penyaluran API)</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Detail label="NIK" value={binaan.nik} />
                        <Detail label="NIS" value={binaan.nis} />
                        <Detail label="Nama Lengkap" value={fullName} />
                        <Detail label="Nama Panggilan" value={binaan.nickname} />
                        <Detail label="Jenis Kelamin" value={binaan.gender} />
                        <Detail label="Tempat, Tanggal Lahir" value={`${binaan.birth_place ?? '-'} , ${binaan.birth_date ? String(binaan.birth_date).slice(0, 10) : '-'}`} />
                        <Detail label="Sekolah" value={binaan.school_name} />
                        <Detail label="Jenjang" value={binaan.school_level} />
                        <Detail label="Kelas" value={binaan.class ?? binaan.grade} />
                        <Detail label="Alamat" value={binaan.address} className="md:col-span-2" />
                        <Detail label="Wali" value={`${binaan.guardian_name ?? '-'} ${binaan.guardian_phone ? `• ${binaan.guardian_phone}` : ''}`} />
                        <Detail label="Sanggar" value={(binaan.sanggar_names ?? []).join(', ') || binaan.sanggar_name || '-'} />
                        <Detail label="Kantor Cabang" value={binaan.kantor_name} />
                        <Detail label="ID Penyaluran" value={binaan.student_id ?? binaan.id} />
                    </div>
                </Card>

                <Card className="space-y-4 p-6">
                    <h2 className="text-lg font-bold">Status OMATIQ</h2>
                    <div className="space-y-3">
                        {status === 'verified' ? (
                            <Badge>
                                <CheckCircle2 className="size-3" />
                                Terverifikasi {binaan.olimpiade_name ? `• ${binaan.olimpiade_name}` : ''}
                            </Badge>
                        ) : status === 'rejected' ? (
                            <Badge variant="destructive">
                                <XCircle className="size-3" />
                                Ditolak {binaan.olimpiade_name ? `• ${binaan.olimpiade_name}` : ''}
                            </Badge>
                        ) : status === 'submitted' ? (
                            <Badge variant="secondary">
                                <Clock3 className="size-3" />
                                Menunggu {binaan.olimpiade_name ? `• ${binaan.olimpiade_name}` : ''}
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Belum Terdaftar</Badge>
                        )}
                        {binaan.registration_number && <p className="text-xs text-muted-foreground">No. Registrasi: {binaan.registration_number}</p>}
                        {registration?.olimpiade?.name && <p className="text-sm">Olimpiade: {registration.olimpiade.name}</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
}

ShowPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Binaan', href: binaanRoute.index().url },
        { title: 'Detail Binaan', href: '#' },
    ],
};

const Detail = ({ label, value, className = '' }: { label: string; value?: string | number | null; className?: string }) => (
    <div className={className}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm leading-7 whitespace-pre-wrap">{value ?? '-'}</p>
    </div>
);
