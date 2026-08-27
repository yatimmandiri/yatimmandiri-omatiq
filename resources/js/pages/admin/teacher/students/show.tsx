import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import teacherStudents from '@/routes/admin/teacher/students';
import { usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const labels: Record<string, string> = {
    male: 'Laki-laki',
    female: 'Perempuan',
    submitted: 'Submitted',
    verified: 'Verified',
    rejected: 'Rejected',
};

export default function ShowPage() {
    const { participant } = usePage<{ participant: Record<string, any> }>()
        .props;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Detail Binaan</h1>
                    <p className="text-sm text-muted-foreground">
                        {participant.registration_number} -{' '}
                        {participant.penyaluran_student_name ?? participant.student?.full_name ?? participant.nik ?? participant.penyaluran_student_nik}
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
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <Card className="space-y-5 p-5">
                    <h2 className="text-lg font-bold">Data Peserta</h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Detail label="NIK" value={participant.penyaluran_student_nik ?? participant.student?.nik ?? participant.nik} />
                        <Detail
                            label="Nama Lengkap"
                            value={participant.penyaluran_student_name ?? participant.student?.full_name}
                        />
                        <Detail
                            label="Nama Panggilan"
                            value={participant.student?.nickname}
                        />
                        <Detail
                            label="Jenis Kelamin"
                            value={labels[participant.student?.gender ?? '']}
                        />
                        <Detail
                            label="Tempat, Tanggal Lahir"
                            value={`${participant.student?.birth_place ?? ''}, ${participant.student?.birth_date?.slice(0, 10) ?? ''}`}
                        />
                        <Detail
                            label="Usia"
                            value={`${participant.student?.age ?? ''} tahun`}
                        />
                        <Detail
                            label="Sekolah"
                            value={participant.student?.school_name}
                        />
                        <Detail
                            label="Kelas"
                            value={participant.student?.grade}
                        />
                        <Detail
                            label="Provinsi"
                            value={participant.student?.province?.name}
                        />
                        <Detail
                            label="Kota/Kabupaten"
                            value={participant.student?.regency?.name}
                        />
                        <Detail
                            label="HP Orang Tua/Wali"
                            value={participant.student?.parent_phone}
                        />
                        <Detail
                            label="Status"
                            value={labels[participant.status]}
                        />
                    </div>
                    <Detail
                        label="ID Penyaluran"
                        value={participant.penyaluran_student_id}
                    />
                    <Detail
                        label="Alamat"
                        value={participant.student?.address}
                    />
                </Card>

                <Card className="space-y-5 p-5">
                    <h2 className="text-lg font-bold">Kategori dan Dokumen</h2>
                    <Detail
                        label="Olimpiade"
                        value={participant.olimpiade?.name}
                    />
                    <Detail
                        label="Guru / Pendamping"
                        value={participant.student?.mentor_name}
                    />
                    <Detail
                        label="HP Pendamping"
                        value={participant.student?.mentor_phone}
                    />
                    <DetailFile
                        label="Foto"
                        url={participant.student?.photo_url}
                    />
                    <DetailFile
                        label="Kartu Identitas"
                        url={participant.student?.identity_card_url}
                    />
                    <DetailFile
                        label="Kartu Keluarga"
                        url={participant.student?.family_card_url}
                    />
                </Card>
            </div>

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-bold">Prestasi</h2>
                <Detail label="Prestasi" value={participant.achievements} />
            </Card>
        </div>
    );
}

ShowPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Binaan',
            href: teacherStudents.index().url,
        },
        {
            title: 'Detail Binaan',
            href: '#',
        },
    ],
};

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
        <p className="mt-1 text-sm leading-7 whitespace-pre-wrap">
            {value ?? '-'}
        </p>
    </div>
);

const DetailFile = ({ label, url }: { label: string; url?: string | null }) => (
    <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
        </p>
        {url ? (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm font-medium text-primary underline"
            >
                Lihat file
            </a>
        ) : (
            <p className="mt-1 text-sm text-muted-foreground">-</p>
        )}
    </div>
);
