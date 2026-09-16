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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import students from '@/routes/admin/companies/students';
import { useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    GraduationCap,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    User,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';

type Option = { id: number | string; name: string };
type Regency = {
    id: string | number;
    province_id?: string | number;
    name: string;
};
type District = {
    id: string | number;
    regency_id?: string | number;
    name: string;
};
type Village = {
    id: string | number;
    district_id?: string | number;
    name: string;
};
type Mentor = { id: number; name: string; email: string; phone?: string };

const dateValue = (value?: string | null) =>
    value ? String(value).slice(0, 10) : '';

export default function EditPage() {
    const {
        student,
        provinces = [],
        initialRegencies = [],
        initialDistricts = [],
        initialVillages = [],
        mentors = [],
    } = usePage<{
        student: Record<string, any>;
        provinces?: Option[];
        initialRegencies?: Regency[];
        initialDistricts?: District[];
        initialVillages?: Village[];
        mentors?: Mentor[];
    }>().props;

    const isBinaan = !!student.is_binaan || !!student.penyaluran_id;

    const [regencies, setRegencies] = useState<Regency[]>(initialRegencies);
    const [districts, setDistricts] = useState<District[]>(initialDistricts);
    const [villages, setVillages] = useState<Village[]>(initialVillages);

    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    const form = useForm<any>({
        full_name: student.full_name ?? student.name ?? '',
        nickname: student.nickname ?? '',
        nik: student.nik ?? '',
        nis: student.nis ?? '',
        gender: student.gender ?? 'male',
        birth_place: student.birth_place ?? '',
        birth_date: dateValue(student.birth_date),
        school_name: student.school_name ?? '',
        school_level: student.school_level ?? '',
        grade: student.grade ?? student.class ?? '',
        address: student.address ?? '',
        province_id: student.province_id ? String(student.province_id) : '',
        regency_id: student.regency_id ? String(student.regency_id) : '',
        district_id: student.district_id ? String(student.district_id) : '',
        village_id: student.village_id ? String(student.village_id) : '',
        parent_phone: student.parent_phone ?? student.guardian_phone ?? '',
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

    useEffect(() => {
        const pid = form.data.province_id;

        if (!pid) {
            setRegencies([]);

            return;
        }

        if (
            regencies.length > 0 &&
            String(regencies[0].province_id) === String(pid)
        ) {
            return;
        }

        setLoadingRegencies(true);
        fetch(`/regions/regencies?province_id=${encodeURIComponent(pid)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => setRegencies(p.data ?? []))
            .catch(() => setRegencies([]))
            .finally(() => setLoadingRegencies(false));
    }, [form.data.province_id]);

    useEffect(() => {
        const rid = form.data.regency_id;

        if (!rid) {
            setDistricts([]);

            return;
        }

        if (
            districts.length > 0 &&
            String(districts[0].regency_id) === String(rid)
        ) {
            return;
        }

        setLoadingDistricts(true);
        fetch(`/regions/districts?regency_id=${encodeURIComponent(rid)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => setDistricts(p.data ?? []))
            .catch(() => setDistricts([]))
            .finally(() => setLoadingDistricts(false));
    }, [form.data.regency_id]);

    useEffect(() => {
        const did = form.data.district_id;

        if (!did) {
            setVillages([]);

            return;
        }

        if (
            villages.length > 0 &&
            String(villages[0].district_id) === String(did)
        ) {
            return;
        }

        setLoadingVillages(true);
        fetch(`/regions/villages?district_id=${encodeURIComponent(did)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => setVillages(p.data ?? []))
            .catch(() => setVillages([]))
            .finally(() => setLoadingVillages(false));
    }, [form.data.district_id]);

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
                        Edit Data Binaan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pembaruan data santri/siswa ini akan langsung
                        disinkronkan ke server Penyaluran jika terdaftar sebagai
                        binaan.
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
            <Card className={isBinaan ? 'border-muted bg-muted/20' : ''}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="size-5 text-primary" />
                            <CardTitle className="text-base font-semibold">
                                Data Pribadi
                            </CardTitle>
                        </div>
                        {isBinaan && (
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                Identitas Binaan Penyaluran (Read-Only)
                            </span>
                        )}
                    </div>
                    <CardDescription>
                        {isBinaan
                            ? 'Identitas santri binaan terhubung dengan Penyaluran. Hanya data pendidikan dan domisili yang dapat diubah.'
                            : 'Informasi identitas dasar siswa/santri.'}
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
                                disabled={isBinaan}
                                className={isBinaan ? 'bg-muted/50 cursor-not-allowed font-medium' : ''}
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
                                disabled={isBinaan}
                                className={isBinaan ? 'bg-muted/50 cursor-not-allowed' : ''}
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
                                disabled={isBinaan}
                                className={isBinaan ? 'bg-muted/50 cursor-not-allowed' : ''}
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
                                placeholder="Nomor induk siswa (opsional)"
                                disabled={isBinaan}
                                className={isBinaan ? 'bg-muted/50 cursor-not-allowed' : ''}
                            />
                        </Field>

                        <Field label="Jenis Kelamin *" error={error('gender')}>
                            <Select
                                value={form.data.gender}
                                onValueChange={(v) => form.setData('gender', v)}
                                disabled={isBinaan}
                            >
                                <SelectTrigger className={`w-full ${isBinaan ? 'bg-muted/50 cursor-not-allowed' : ''}`}>
                                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">
                                        Laki-laki (L)
                                    </SelectItem>
                                    <SelectItem value="female">
                                        Perempuan (P)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
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
                                placeholder="Tempat lahir"
                                disabled={isBinaan}
                                className={isBinaan ? 'bg-muted/50 cursor-not-allowed' : ''}
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
                                disabled={isBinaan}
                                className={isBinaan ? 'bg-muted/50 cursor-not-allowed' : ''}
                                required
                            />
                        </Field>

                        <Field
                            label="No. HP / WhatsApp Wali *"
                            error={error('parent_phone')}
                        >
                            <Input
                                value={form.data.parent_phone}
                                onChange={(e) =>
                                    form.setData('parent_phone', e.target.value)
                                }
                                placeholder="08xxxxxxxxxx"
                                disabled={isBinaan}
                                className={isBinaan ? 'bg-muted/50 cursor-not-allowed' : ''}
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
                            <Select
                                value={form.data.school_level || undefined}
                                onValueChange={(v) =>
                                    form.setData('school_level', v)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Jenjang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SD">SD / MI</SelectItem>
                                    <SelectItem value="SMP">
                                        SMP / MTs
                                    </SelectItem>
                                    <SelectItem value="SMA">
                                        SMA / MA
                                    </SelectItem>
                                    <SelectItem value="SMK">SMK</SelectItem>
                                </SelectContent>
                            </Select>
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
                            Alamat & Domisili
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Lokasi domisili tempat tinggal santri/siswa.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Alamat Lengkap *" error={error('address')}>
                        <Textarea
                            value={form.data.address}
                            onChange={(e) =>
                                form.setData('address', e.target.value)
                            }
                            placeholder="Alamat tempat tinggal binaan..."
                            rows={3}
                            required
                        />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Provinsi *" error={error('province_id')}>
                            <Select
                                value={form.data.province_id || undefined}
                                onValueChange={(v) => {
                                    form.setData((d: any) => ({
                                        ...d,
                                        province_id: v,
                                        regency_id: '',
                                        district_id: '',
                                        village_id: '',
                                    }));
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Provinsi" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {provinces.map((p) => (
                                        <SelectItem
                                            key={String(p.id)}
                                            value={String(p.id)}
                                        >
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field
                            label="Kabupaten / Kota *"
                            error={error('regency_id')}
                        >
                            <Select
                                value={form.data.regency_id || undefined}
                                onValueChange={(v) => {
                                    form.setData((d: any) => ({
                                        ...d,
                                        regency_id: v,
                                        district_id: '',
                                        village_id: '',
                                    }));
                                }}
                                disabled={
                                    !form.data.province_id || loadingRegencies
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            loadingRegencies
                                                ? 'Memuat...'
                                                : form.data.province_id
                                                  ? 'Pilih Kabupaten / Kota'
                                                  : 'Pilih provinsi terlebih dahulu'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {regencies.map((r) => (
                                        <SelectItem
                                            key={String(r.id)}
                                            value={String(r.id)}
                                        >
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field label="Kecamatan" error={error('district_id')}>
                            <Select
                                value={form.data.district_id || undefined}
                                onValueChange={(v) => {
                                    form.setData((d: any) => ({
                                        ...d,
                                        district_id: v,
                                        village_id: '',
                                    }));
                                }}
                                disabled={
                                    !form.data.regency_id || loadingDistricts
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            loadingDistricts
                                                ? 'Memuat...'
                                                : form.data.regency_id
                                                  ? 'Pilih Kecamatan'
                                                  : 'Pilih kota/kabupaten terlebih dahulu'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {districts.map((d) => (
                                        <SelectItem
                                            key={String(d.id)}
                                            value={String(d.id)}
                                        >
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field
                            label="Kelurahan / Desa"
                            error={error('village_id')}
                        >
                            <Select
                                value={form.data.village_id || undefined}
                                onValueChange={(v) =>
                                    form.setData('village_id', v)
                                }
                                disabled={
                                    !form.data.district_id || loadingVillages
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            loadingVillages
                                                ? 'Memuat...'
                                                : form.data.district_id
                                                  ? 'Pilih Kelurahan / Desa'
                                                  : 'Pilih kecamatan terlebih dahulu'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {villages.map((v) => (
                                        <SelectItem
                                            key={String(v.id)}
                                            value={String(v.id)}
                                        >
                                            {v.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>
                </CardContent>
            </Card>

            {/* Kontak & Pembimbing */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Phone className="size-5 text-primary" />
                        <CardTitle className="text-base font-semibold">
                            Kontak & Pembimbing
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Informasi guru pembimbing / mentor santri binaan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field
                            label="Guru Pembimbing / Mentor"
                            error={error('mentor_id')}
                        >
                            <Select
                                value={form.data.mentor_id || 'none'}
                                onValueChange={(v) => {
                                    const selectedId = v === 'none' ? '' : v;
                                    const mentorObj = mentors.find(
                                        (m) => String(m.id) === selectedId,
                                    );
                                    form.setData((d: any) => ({
                                        ...d,
                                        mentor_id: selectedId,
                                        mentor_name: mentorObj?.name ?? '',
                                        mentor_phone: mentorObj?.phone ?? '',
                                    }));
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Mentor / Guru" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    <SelectItem value="none">
                                        Tidak Ada / Mandiri
                                    </SelectItem>
                                    {mentors.map((m) => (
                                        <SelectItem
                                            key={String(m.id)}
                                            value={String(m.id)}
                                        >
                                            {m.name} ({m.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field
                            label="No. WhatsApp / HP Pembimbing"
                            error={error('mentor_phone')}
                        >
                            <Input
                                value={form.data.mentor_phone}
                                onChange={(e) =>
                                    form.setData('mentor_phone', e.target.value)
                                }
                                placeholder="08xxxxxxxxxx"
                            />
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
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Binaan', href: students.index().url },
        { title: 'Edit', href: '#' },
    ],
};
