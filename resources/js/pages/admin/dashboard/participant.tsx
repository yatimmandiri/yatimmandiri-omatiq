import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import { Head, usePage } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

const labels: Record<string, string> = {
    male: 'Laki-laki',
    female: 'Perempuan',
    submitted: 'Submitted',
    verified: 'Verified',
    rejected: 'Rejected',
};

const statusVariant = (status: string) =>
    status === 'verified' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';

export default function Dashboard() {
    const { participant } = usePage<{ participant: Record<string, any> }>().props;

    if (!participant) {
        return (
            <>
                <Head title="Dashboard Partisipan" />
                <div className="flex h-full flex-1 items-center justify-center p-4">
                    <Card className="max-w-md p-8 text-center">
                        <h2 className="mb-2 text-xl font-bold">Belum Terdaftar</h2>
                        <p className="text-sm text-muted-foreground">
                            Akun Anda belum terhubung dengan data peserta. Silakan hubungi admin.
                        </p>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Dashboard Partisipan" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard Saya</h1>
                        <div className="mt-1 flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                                {participant.registration_number} — {participant.student?.full_name ?? participant.user?.name}
                            </p>
                            <Badge variant={statusVariant(participant.status) as any}>
                                {labels[participant.status] ?? participant.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                    <Card className="space-y-5 p-5">
                        <h2 className="text-lg font-bold">Biodata</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Detail label="Nama Lengkap" value={participant.student?.full_name} />
                            <Detail label="Nama Panggilan" value={participant.student?.nickname} />
                            <Detail label="Jenis Kelamin" value={labels[participant.student?.gender]} />
                            <Detail
                                label="Tempat, Tanggal Lahir"
                                value={`${participant.student?.birth_place ?? ''}, ${participant.student?.birth_date?.slice(0, 10) ?? ''}`}
                            />
                            <Detail label="Usia" value={participant.student?.age ? `${participant.student.age} tahun` : null} />
                            <Detail label="Sekolah" value={participant.student?.school_name} />
                            <Detail label="Kelas" value={participant.student?.grade} />
                            <Detail label="Provinsi" value={participant.student?.province?.name} />
                            <Detail label="Kota/Kabupaten" value={participant.student?.regency?.name} />
                            <Detail label="HP Orang Tua/Wali" value={participant.student?.parent_phone} />
                        </div>
                        <Detail label="Alamat" value={participant.student?.address} />
                    </Card>

                    <Card className="space-y-5 p-5">
                        <h2 className="text-lg font-bold">Olimpiade & Pendamping</h2>
                        <Detail label="Cabang Olimpiade" value={participant.olimpiade?.name} />
                        <Detail label="Kategori" value={participant.olimpiade?.category} />
                        <Detail label="Guru / Pendamping" value={participant.student?.mentor_name} />
                        <Detail label="HP Pendamping" value={participant.student?.mentor_phone} />
                        <Detail label="Referensi" value={participant.referral_source === 'other' ? participant.referral_source_other : labels[participant.referral_source]} />
                    </Card>
                </div>

                <Card className="space-y-5 p-5">
                    <h2 className="text-lg font-bold">Dokumen</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <FileLink label="Pas Foto" href={participant.student?.photo_url} />
                        <FileLink label="Kartu Identitas" href={participant.student?.identity_card_url} />
                        <FileLink label="Kartu Keluarga" href={participant.student?.family_card_url} />
                    </div>
                </Card>

                {participant.payment_status && (
                    <Card className="space-y-5 p-5">
                        <h2 className="text-lg font-bold">Pembayaran</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Detail label="Status" value={participant.payment_status === 'paid' ? 'Lunas' : participant.payment_status === 'unpaid' ? 'Belum Bayar' : participant.payment_status} />
                            <Detail label="Jumlah" value={participant.payment_amount ? `Rp ${Number(participant.payment_amount).toLocaleString('id-ID')}` : null} />
                            <FileLink label="Bukti Bayar" href={participant.payment_proof_url} />
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

const Detail = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-1 text-sm leading-7 whitespace-pre-wrap">{value ?? '-'}</p>
    </div>
);

const FileLink = ({ label, href }: { label: string; href?: string | null }) => (
    <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
        {href ? (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary underline"
            >
                Lihat file
                <ExternalLink className="h-4 w-4" />
            </a>
        ) : (
            <p className="mt-1 text-sm">-</p>
        )}
    </div>
);
