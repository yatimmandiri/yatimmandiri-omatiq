import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import students from '@/routes/admin/companies/students';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function ShowPage() {
    const { student, participants } = usePage<{ student: any; participants: any[] }>().props;

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{student.full_name}</h1>
                    <p className="text-sm text-muted-foreground">{student.nik} {student.nis ? `• ${student.nis}` : ''}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={students.index().url}>
                            <ArrowLeft /> Kembali
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={students.edit(student.id).url}>
                            <Pencil /> Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="space-y-4 p-5">
                    <h2 className="text-lg font-semibold">Biodata</h2>
                    <div className="flex gap-2">
                        <Badge>{student.is_binaan ? 'Binaan' : 'Umum'}</Badge>
                        <Badge variant={student.is_active ? 'default' : 'destructive'}>{student.is_active ? 'Aktif' : 'Non-aktif'}</Badge>
                        <Badge variant="outline">{student.gender ?? '-'}</Badge>
                    </div>
                    <Detail label="NIK" value={student.nik} />
                    <Detail label="NIS" value={student.nis} />
                    <Detail label="Nama" value={student.full_name} />
                    <Detail label="Sekolah" value={student.school_name} />
                    <Detail label="Jenjang" value={student.school_level} />
                    <Detail label="Kelas" value={student.grade} />
                    <Detail label="Alamat" value={student.address} />
                    <Detail label="Wilayah" value={`${student.province?.name ?? ''} ${student.regency?.name ?? ''}`} />
                    <Detail label="Mentor" value={student.mentor?.name ?? student.mentor_name} />
                    <Detail label="HP Wali" value={student.parent_phone} />
                    <Detail label="Penyaluran ID" value={student.penyaluran_id} />
                </Card>

                <Card className="space-y-4 p-5">
                    <h2 className="text-lg font-semibold">Peserta Terdaftar ({participants?.length ?? 0})</h2>
                    {participants?.length ? (
                        <div className="space-y-2">
                            {participants.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                                    <span>{p.olimpiade?.name ?? '-'}</span>
                                    <Badge variant={p.status === 'verified' ? 'default' : p.status === 'rejected' ? 'destructive' : 'secondary'}>{p.status}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Belum ada pendaftaran.</p>
                    )}
                </Card>
            </div>
        </div>
    );
}

ShowPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Students', href: students.index().url },
        { title: 'Detail', href: '#' },
    ],
};

const Detail = ({ label, value }: { label: string; value?: any }) => (
    <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm">{value ?? '-'}</p>
    </div>
);
