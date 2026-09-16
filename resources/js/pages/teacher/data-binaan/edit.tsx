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
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/teacher';
import binaanRoutes from '@/routes/teacher/data-binaan';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, GraduationCap, MapPin, Save, User } from 'lucide-react';
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

const dateValue = (value?: string | null) =>
    value ? String(value).slice(0, 10) : '';

export default function EditPage() {
    const {
        binaan: student,
        provinces = [],
        initialRegencies = [],
        initialDistricts = [],
        initialVillages = [],
    } = usePage<{
        binaan: Record<string, any>;
        provinces?: Option[];
        initialRegencies?: Regency[];
        initialDistricts?: District[];
        initialVillages?: Village[];
    }>().props;

    const [regencies, setRegencies] = useState<Regency[]>(initialRegencies);
    const [districts, setDistricts] = useState<District[]>(initialDistricts);
    const [villages, setVillages] = useState<Village[]>(initialVillages);

    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    const form = useForm<any>({
        school_name: student.school_name ?? '',
        school_level: student.school_level ?? '',
        grade: student.grade ?? student.class ?? '',
        address: student.address ?? '',
        province_id: student.province_id ? String(student.province_id) : '',
        regency_id: student.regency_id ? String(student.regency_id) : '',
        district_id: student.district_id ? String(student.district_id) : '',
        village_id: student.village_id ? String(student.village_id) : '',
    });

    form.transform((data: any) => ({
        ...data,
        _method: 'put',
    }));

    useEffect(() => {
        const pid = form.data.province_id;

        if (!pid) {
            setRegencies([]);

            return;
        }

        if (
            regencies.length > 0 &&
            String(regencies[0].province_id ?? '') === String(pid)
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
            String(districts[0].regency_id ?? '') === String(rid)
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
            String(villages[0].district_id ?? '') === String(did)
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
        form.post(binaanRoutes.update(student.id).url);
    };

    const error = (field: string) =>
        form.errors[field] ? (
            <p className="text-xs font-medium text-destructive">
                {form.errors[field]}
            </p>
        ) : null;

    const studentFullName = student.full_name ?? student.name ?? '-';
    const studentGender =
        student.gender === 'male' || student.gender === 'L'
            ? 'Laki-laki (L)'
            : student.gender === 'female' || student.gender === 'P'
              ? 'Perempuan (P)'
              : '-';

    return (
        <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Data Binaan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pembaruan data pendidikan dan domisili santri ini akan
                        langsung disinkronkan ke server Penyaluran.
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

            {/* Data Pribadi (Read-Only) */}
            <Card className="border-muted bg-muted/20">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="size-5 text-muted-foreground" />
                            <CardTitle className="text-base font-semibold">
                                Data Identitas Santri
                            </CardTitle>
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            Penyaluran (Read-Only)
                        </span>
                    </div>
                    <CardDescription>
                        Identitas utama santri terhubung langsung dengan
                        Penyaluran dan tidak dapat diubah di sini.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Nama Lengkap">
                            <Input
                                value={studentFullName}
                                disabled
                                className="bg-muted/50 cursor-not-allowed font-medium text-foreground"
                            />
                        </Field>

                        <Field label="Nama Panggilan">
                            <Input
                                value={student.nickname || '-'}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                        </Field>

                        <Field label="NIK (Nomor Induk Kependudukan)">
                            <Input
                                value={student.nik || '-'}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                        </Field>

                        <Field label="NIS">
                            <Input
                                value={student.nis || '-'}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                        </Field>

                        <Field label="Jenis Kelamin">
                            <Input
                                value={studentGender}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                        </Field>

                        <Field label="Tempat / Tanggal Lahir">
                            <Input
                                value={`${student.birth_place || '-'}, ${dateValue(student.birth_date) || '-'}`}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                        </Field>

                        <Field label="No. HP / WhatsApp Wali">
                            <Input
                                value={
                                    student.parent_phone ||
                                    student.guardian_phone ||
                                    '-'
                                }
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                        </Field>
                    </div>
                </CardContent>
            </Card>

            {/* Pendidikan & Sekolah */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="size-5 text-primary" />
                        <CardTitle className="text-base font-semibold">
                            Pendidikan & Sekolah
                        </CardTitle>
                    </div>
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
                                    placeholder="Nama sekolah asal"
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
                        <Field label="Provinsi" error={error('province_id')}>
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
                            label="Kabupaten / Kota"
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
        { title: 'Data Binaan', href: binaanRoutes.index().url },
        { title: 'Edit', href: '#' },
    ],
};
