import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import participants from '@/routes/admin/companies/participants';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';

const labels: Record<string, string> = {
    male: 'Laki-laki',
    female: 'Perempuan',
    sanggar_genius: 'Sanggar Genius',
    sanggar_alquran: "Sanggar Al-Qur'an",
    asrama_yatim_mandiri: 'Asrama Yatim Mandiri',
    other: 'Program Lainnya',
    submitted: 'Submitted',
    verified: 'Verified',
    rejected: 'Rejected',
};

export default function ShowPage() {
    const { participant } = usePage<{ participant: Record<string, any> }>().props;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Detail Peserta</h1>
                    <p className="text-sm text-muted-foreground">
                        {participant.registration_number} - {participant.full_name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft />
                        Kembali
                    </Button>
                    <Button onClick={() => router.visit(participants.edit(participant.id).url)}>
                        <Pencil />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <Card className="space-y-5 p-5">
                    <h2 className="text-lg font-bold">Data Peserta</h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Detail label="Nama Lengkap" value={participant.full_name} />
                        <Detail label="Nama Panggilan" value={participant.nickname} />
                        <Detail label="Jenis Kelamin" value={labels[participant.gender]} />
                        <Detail label="Tempat, Tanggal Lahir" value={`${participant.birth_place}, ${participant.birth_date?.slice(0, 10)}`} />
                        <Detail label="Usia" value={`${participant.age} tahun`} />
                        <Detail label="Jenjang" value={participant.education_level} />
                        <Detail label="Sekolah" value={participant.school_name} />
                        <Detail label="Kelas" value={participant.grade} />
                        <Detail label="Provinsi" value={participant.province?.name} />
                        <Detail label="Kota/Kabupaten" value={participant.regency?.name} />
                        <Detail label="HP Orang Tua/Wali" value={participant.parent_phone} />
                        <Detail label="Status" value={labels[participant.status]} />
                    </div>
                    <Detail label="Alamat" value={participant.address} />
                </Card>

                <Card className="space-y-5 p-5">
                    <h2 className="text-lg font-bold">Kategori dan Binaan</h2>
                    <Detail label="Olimpiade" value={participant.olimpiade?.name} />
                    <Detail label="Program Binaan" value={labels[participant.development_program]} />
                    <Detail label="Program Lainnya" value={participant.development_program_other} />
                    <Detail label="Nama Sanggar / Asrama" value={participant.institution_name} />
                    <Detail label="Kantor Layanan / Cabang" value={participant.branch_office} />
                    <Detail label="Guru / Pendamping" value={participant.mentor_name} />
                    <Detail label="HP Pendamping" value={participant.mentor_phone} />
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="space-y-5 p-5">
                    <h2 className="text-lg font-bold">Prestasi dan Pengalaman</h2>
                    <Detail label="Prestasi" value={participant.achievements} />
                    <Detail label="Pernah Mengikuti OMATIQ" value={participant.has_joined_before ? 'Ya' : 'Tidak'} />
                    <Detail label="Tahun Sebelumnya" value={participant.previous_year} />
                    <Detail label="Catatan Admin" value={participant.notes} />
                </Card>
                <Card className="space-y-5 p-5">
                    <h2 className="text-lg font-bold">Dokumen</h2>
                    <FileLink label="Pas Foto" href={participant.photo_url} />
                    <FileLink label="Kartu Pelajar / Identitas" href={participant.identity_card_url} />
                    <FileLink label="Surat Rekomendasi" href={participant.recommendation_letter_url} />
                    <FileLink label="Sertifikat Prestasi" href={participant.achievement_certificate_url} />
                    <Detail label="Tanda Tangan Peserta" value={participant.participant_signature_name} />
                    <Detail label="Tanda Tangan Wali" value={participant.guardian_signature_name} />
                </Card>
            </div>
        </div>
    );
}

const Detail = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
        </p>
        <p className="mt-1 text-sm leading-7 whitespace-pre-wrap">{value ?? '-'}</p>
    </div>
);

const FileLink = ({ label, href }: { label: string; href?: string | null }) => (
    <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
        </p>
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
