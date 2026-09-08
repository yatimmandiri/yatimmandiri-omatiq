import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import students from '@/routes/admin/companies/students';
import { useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    User,
    GraduationCap,
    MapPin,
    Phone,
    ShieldCheck,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo } from 'react';

type Option = { id: number | string; name: string };
type Regency = { id: string; province_id: string; name: string };
type Mentor = { id: number; name: string; email: string };

const dateValue = (value?: string | null) =>
    value ? String(value).slice(0, 10) : '';

export default function EditPage() {
    const {
        student,
        provinces = [],
        regencies = [],
        mentors = [],
    } = usePage<{
        student: Record<string, any>;
        provinces?: Option[];
        regencies?: Regency[];
        mentors?: Mentor[];
    }>().props;

    const form = useForm<any>({
        full_name: student.full_name ?? '',
        nickname: student.nickname ?? '',
        nik: student.nik ?? '',
        nis: student.nis ?? '',
        gender: student.gender ?? 'male',
        birth_place: student.birth_place ?? '',
        birth_date: dateValue(student.birth_date),
        school_name: student.school_name ?? '',
        school_level: student.school_level ?? '',
        grade: student.grade ?? '',
        address: student.address ?? '',
        province_id: student.province_id ? String(student.province_id) : '',
        regency_id: student.regency_id ? String(student.regency_id) : '',
        parent_phone: student.parent_phone ?? '',
        mentor_id: student.mentor_id ? String(student.mentor_id) : '',
        mentor_name: student.mentor_name ?? '',
        mentor_phone: student.mentor_phone ?? '',
        is_binaan: !!student.is_binaan,
        is_active: student.is_active !== undefined ? !!student.is_active : true,
    });

    form.transform((data: any) => ({
        ...data,
        _method: 'put',
        is_binaan: data.is_binaan ? 1 : 0,
        is_active: data.is_active ? 1 : 0,
    }));

    const filteredRegencies = useMemo(
        () =>
            regencies.filter(
                (regency) =>
                    String(regency.province_id) ===
                    String(form.data.province_id),
            ),
        [form.data.province_id, regencies],
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(students.update(student.id).url);
    };

    const error = (field: string) =>
        form.errors[field] ? (
            <p className="text-xs font-medium text-destructive">
                {form.errors[field]}
            </p>
        ) : null;

    return (
        <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Data Binaan / Student
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Perbarui data master santri/siswa ({student.full_name}).
                        Sinkronisasi ke Penyaluran otomatis jika terhubung.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="size-4" /> Kembali
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save className="size-4" />{' '}
                        {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </div>

            {/* Data Pribadi */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <User className="size-5 text-primary" />
                        <CardTitle className="text-base font-semibold">
                            Data Pribadi
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Informasi identitas dasar siswa/santri.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field
                            label="Nama Lengkap *"
                            error={error('full_name')}
                        >
                            <Input
                                value={form.data.full_name}
                                onChange={(e) =>
                                    form.setData('full_name', e.target.value)
                                }
                                placeholder="Nama lengkap sesuai identitas"
                                required
                            />
                        </Field>

                        <Field label="Nama Panggilan" error={error('nickname')}>
                            <Input
                                value={form.data.nickname}
                                onChange={(e) =>
                                    form.setData('nickname', e.target.value)
                                }
                                placeholder="Nama panggilan"
                            />
                        </Field>

                        <Field
                            label="NIK (Nomor Induk Kependudukan) *"
                            error={error('nik')}
                        >
                            <Input
                                value={form.data.nik}
                                onChange={(e) =>
                                    form.setData('nik', e.target.value)
                                }
                                placeholder="16 digit NIK"
                                maxLength={16}
                                required
                            />
                        </Field>

                        <Field
                            label="NIS (Nomor Induk Siswa)"
                            error={error('nis')}
                        >
                            <Input
                                value={form.data.nis}
                                onChange={(e) =>
                                    form.setData('nis', e.target.value)
                                }
                                placeholder="Nomor induk siswa"
                            />
                        </Field>

                        <Field label="Jenis Kelamin *" error={error('gender')}>
                            <select
                                value={form.data.gender}
                                onChange={(e) =>
                                    form.setData('gender', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-ring focus:outline-none"
                                required
                            >
                                <option value="male">Laki-laki (L)</option>
                                <option value="female">Perempuan (P)</option>
                            </select>
                        </Field>

                        <Field
                            label="Tempat Lahir"
                            error={error('birth_place')}
                        >
                            <Input
                                value={form.data.birth_place}
                                onChange={(e) =>
                                    form.setData('birth_place', e.target.value)
                                }
                                placeholder="Kota/Kabupaten lahir"
                            />
                        </Field>

                        <Field
                            label="Tanggal Lahir *"
                            error={error('birth_date')}
                        >
                            <Input
                                type="date"
                                value={form.data.birth_date}
                                onChange={(e) =>
                                    form.setData('birth_date', e.target.value)
                                }
                                required
                            />
                        </Field>
                    </div>
                </CardContent>
            </Card>

            {/* Data Pendidikan & Sekolah */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="size-5 text-primary" />
                        <CardTitle className="text-base font-semibold">
                            Pendidikan & Sekolah
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Informasi sekolah dan jenjang pendidikan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Field
                                label="Nama Sekolah *"
                                error={error('school_name')}
                            >
                                <Input
                                    value={form.data.school_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'school_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: SDN 1 Surabaya"
                                    required
                                />
                            </Field>
                        </div>

                        <Field label="Jenjang" error={error('school_level')}>
                            <select
                                value={form.data.school_level}
                                onChange={(e) =>
                                    form.setData('school_level', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-ring focus:outline-none"
                            >
                                <option value="">Pilih Jenjang</option>
                                <option value="SD">SD / MI</option>
                                <option value="SMP">SMP / MTs</option>
                                <option value="SMA">SMA / MA</option>
                                <option value="SMK">SMK</option>
                            </select>
                        </Field>

                        <Field label="Kelas / Tingkat *" error={error('grade')}>
                            <Input
                                value={form.data.grade}
                                onChange={(e) =>
                                    form.setData('grade', e.target.value)
                                }
                                placeholder="Contoh: 4 atau IV"
                                required
                            />
                        </Field>
                    </div>
                </CardContent>
            </Card>

            {/* Alamat & Wilayah */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="size-5 text-primary" />
                        <CardTitle className="text-base font-semibold">
                            Alamat & Wilayah
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Lokasi domisili santri/siswa.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Alamat Lengkap *" error={error('address')}>
                        <Textarea
                            value={form.data.address}
                            onChange={(e) =>
                                form.setData('address', e.target.value)
                            }
                            placeholder="Jalan, RT/RW, Dusun, Kelurahan..."
                            rows={3}
                            required
                        />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Provinsi *" error={error('province_id')}>
                            <select
                                value={form.data.province_id}
                                onChange={(e) => {
                                    form.setData('province_id', e.target.value);
                                    form.setData('regency_id', '');
                                }}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-ring focus:outline-none"
                                required
                            >
                                <option value="">Pilih Provinsi</option>
                                {provinces.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="Kabupaten / Kota *"
                            error={error('regency_id')}
                        >
                            <select
                                value={form.data.regency_id}
                                onChange={(e) =>
                                    form.setData('regency_id', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-ring focus:outline-none"
                                disabled={!form.data.province_id}
                                required
                            >
                                <option value="">Pilih Kabupaten / Kota</option>
                                {filteredRegencies.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </CardContent>
            </Card>

            {/* Kontak & Mentor */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Phone className="size-5 text-primary" />
                        <CardTitle className="text-base font-semibold">
                            Kontak & Pembimbing
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Nomor kontak orang tua/wali dan guru pembimbing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field
                            label="No. WhatsApp / HP Orang Tua (Wali) *"
                            error={error('parent_phone')}
                        >
                            <Input
                                value={form.data.parent_phone}
                                onChange={(e) =>
                                    form.setData('parent_phone', e.target.value)
                                }
                                placeholder="08xxxxxxxxxx"
                                required
                            />
                        </Field>

                        <Field
                            label="Guru Pembimbing / Mentor"
                            error={error('mentor_id')}
                        >
                            <select
                                value={form.data.mentor_id}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const mentorObj = mentors.find(
                                        (m) => String(m.id) === selectedId,
                                    );
                                    form.setData('mentor_id', selectedId);

                                    if (mentorObj) {
                                        form.setData(
                                            'mentor_name',
                                            mentorObj.name,
                                        );
                                    }
                                }}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-ring focus:outline-none"
                            >
                                <option value="">Tidak Ada / Mandiri</option>
                                {mentors.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({m.email})
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </CardContent>
            </Card>

            {/* Status & Klasifikasi */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-5 text-primary" />
                        <CardTitle className="text-base font-semibold">
                            Status & Pengaturan
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">
                                    Kategori Binaan
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {form.data.is_binaan
                                        ? 'Santri Binaan Yatim Mandiri'
                                        : 'Peserta Umum / Non-Binaan'}
                                </p>
                            </div>
                            <Switch
                                checked={form.data.is_binaan}
                                onCheckedChange={(v) =>
                                    form.setData('is_binaan', v)
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">
                                    Status Akun / Master
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {form.data.is_active
                                        ? 'Aktif dapat didaftarkan'
                                        : 'Non-aktif'}
                                </p>
                            </div>
                            <Switch
                                checked={form.data.is_active}
                                onCheckedChange={(v) =>
                                    form.setData('is_active', v)
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                >
                    Batal
                </Button>
                <Button type="submit" disabled={form.processing}>
                    <Save className="size-4" />{' '}
                    {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </div>
        </form>
    );
}

function Field({
    label,
    children,
    error,
}: {
    label: string;
    children: ReactNode;
    error?: ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">{label}</Label>
            {children}
            {error}
        </div>
    );
}

EditPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Students', href: students.index().url },
        { title: 'Edit', href: '#' },
    ],
};
