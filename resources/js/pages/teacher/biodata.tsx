import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    CircleAlert,
    CircleUser,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Save,
    User,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

type Option = { id: number | string; name: string };
type Regency = {
    id: number | string;
    province_id: number | string;
    name: string;
};
type District = {
    id: number | string;
    regency_id: number | string;
    name: string;
};
type Village = {
    id: number | string;
    district_id: number | string;
    name: string;
};

type PageProps = {
    biodata: {
        name: string | null;
        email: string | null;
        phone: string | null;
        nik: string | null;
        gender: string | null;
        birth_place: string | null;
        birth_date: string | null;
        address: string | null;
        photo_url: string | null;
        province_id: number | string | null;
        regency_id: number | string | null;
        district_id: number | string | null;
        village_id: number | string | null;
        completeness: {
            fields: Record<string, boolean>;
            filled: number;
            total: number;
            percent: number;
            is_complete: boolean;
            missing: string[];
        };
    };
    provinces: Option[];
    initialRegencies?: Regency[];
    initialDistricts?: District[];
    initialVillages?: Village[];
};

export default function GuruBiodata() {
    const {
        biodata: initial,
        provinces = [],
        initialRegencies = [],
        initialDistricts = [],
        initialVillages = [],
    } = usePage<PageProps>().props;

    const form = useForm({
        name: initial.name ?? '',
        nik: initial.nik ?? '',
        gender: (initial.gender as '' | 'male' | 'female') ?? '',
        birth_place: initial.birth_place ?? '',
        birth_date: initial.birth_date ?? '',
        address: initial.address ?? '',
        province_id: initial.province_id ? String(initial.province_id) : '',
        regency_id: initial.regency_id ? String(initial.regency_id) : '',
        district_id: initial.district_id ? String(initial.district_id) : '',
        village_id: initial.village_id ? String(initial.village_id) : '',
    });

    const [regencies, setRegencies] = useState<Regency[]>(initialRegencies);
    const [districts, setDistricts] = useState<District[]>(initialDistricts);
    const [villages, setVillages] = useState<Village[]>(initialVillages);
    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

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
        form.put('/teacher/biodata', {
            preserveScroll: true,
        });
    };

    const completeness = initial.completeness;
    const initials =
        (initial.name ?? 'GU')
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase() || 'GR';

    return (
        <>
            <Head title="Biodata Guru" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Hero Header */}
                <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-[#17524A] via-[#1a6359] to-[#258a7c] shadow-sm">
                    <div className="flex flex-col gap-6 p-6 text-white lg:flex-row lg:items-center lg:justify-between lg:p-8">
                        <div className="flex items-center gap-5">
                            <div className="relative shrink-0">
                                {initial.photo_url ? (
                                    <img
                                        src={initial.photo_url}
                                        alt={initial.name ?? 'Guru'}
                                        className="size-20 rounded-2xl border-2 border-white/20 object-cover shadow-lg lg:size-24"
                                    />
                                ) : (
                                    <div className="flex size-20 items-center justify-center rounded-2xl bg-white/15 text-xl font-black tracking-wide backdrop-blur lg:size-24 lg:text-2xl">
                                        {initials}
                                    </div>
                                )}
                                <span
                                    className={`absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white text-xs shadow ${completeness.is_complete ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                >
                                    {completeness.is_complete ? (
                                        <CheckCircle2 className="size-3.5 text-white" />
                                    ) : (
                                        <CircleAlert className="size-3.5 text-white" />
                                    )}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
                                    {initial.name ?? 'Lengkapi Biodata'}
                                </h1>
                                <div className="mt-1.5 flex flex-col gap-1 text-sm text-white/85">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail className="size-3.5 opacity-70" />
                                        {initial.email ?? '-'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone className="size-3.5 opacity-70" />
                                        {initial.phone ?? '-'}
                                    </span>
                                </div>
                                <Badge className="mt-2 border-white/20 bg-white/15 text-white hover:bg-white/20">
                                    {completeness.is_complete
                                        ? 'Biodata Lengkap'
                                        : `${completeness.missing.length} data belum lengkap`}
                                </Badge>
                            </div>
                        </div>

                        <div className="min-w-[220px] rounded-2xl bg-white/10 p-4 backdrop-blur">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span>Kelengkapan</span>
                                <span className="font-bold">
                                    {completeness.filled}/{completeness.total} ·{' '}
                                    {completeness.percent}%
                                </span>
                            </div>
                            <Progress
                                value={completeness.percent}
                                className="mt-2 h-2 bg-white/20 [&>div]:bg-[#E5BE1E]"
                            />
                            <p className="mt-2 text-xs leading-relaxed text-white/75">
                                {completeness.is_complete
                                    ? 'Mantap! Biodata sudah lengkap dan sinkron dengan Penyaluran.'
                                    : 'Lengkapi data yang masih kosong agar validasi pendaftaran binaan lancar.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                    {/* Form */}
                    <div className="space-y-6">
                        {/* Identitas Dasar */}
                        <Card className="rounded-2xl shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A]">
                                        <User className="size-4.5" />
                                    </span>
                                    <div>
                                        <CardTitle className="text-base">
                                            Identitas Dasar
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Data utama guru — wajib terisi dengan
                                            benar
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={submit}
                                    className="flex flex-col gap-5"
                                    id="biodata-form"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            Nama Lengkap{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={form.data.name}
                                            onChange={(e) =>
                                                form.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Nama sesuai KTP / Penyaluran"
                                            required
                                            className="h-10"
                                        />
                                        <InputError
                                            message={form.errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="nik">
                                                NIK{' '}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    (10–16 digit)
                                                </span>
                                            </Label>
                                            <Input
                                                id="nik"
                                                value={form.data.nik}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'nik',
                                                        e.target.value
                                                            .replace(/\D/g, '')
                                                            .slice(0, 16),
                                                    )
                                                }
                                                placeholder="3201xxxxxxxxxxxx"
                                                inputMode="numeric"
                                                maxLength={16}
                                                className="h-10"
                                            />
                                            <InputError
                                                message={form.errors.nik}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Jenis Kelamin</Label>
                                            <Select
                                                value={
                                                    form.data.gender ||
                                                    undefined
                                                }
                                                onValueChange={(v) =>
                                                    form.setData(
                                                        'gender',
                                                        v as any,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-10 w-full">
                                                    <SelectValue placeholder="Pilih gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">
                                                        Laki-laki
                                                    </SelectItem>
                                                    <SelectItem value="female">
                                                        Perempuan
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={form.errors.gender}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="birth_place">
                                                Tempat Lahir
                                            </Label>
                                            <Input
                                                id="birth_place"
                                                value={form.data.birth_place}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'birth_place',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Kota kelahiran"
                                                className="h-10"
                                            />
                                            <InputError
                                                message={
                                                    form.errors.birth_place
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="birth_date">
                                                Tanggal Lahir
                                            </Label>
                                            <Input
                                                id="birth_date"
                                                type="date"
                                                value={form.data.birth_date}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'birth_date',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10"
                                            />
                                            <InputError
                                                message={form.errors.birth_date}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Domisili */}
                        <Card className="rounded-2xl shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                        <MapPin className="size-4.5" />
                                    </span>
                                    <div>
                                        <CardTitle className="text-base">
                                            Domisili & Alamat
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Wilayah bertingkat — pilih berurutan
                                            dari provinsi
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Provinsi</Label>
                                        <Select
                                            value={
                                                form.data.province_id ||
                                                undefined
                                            }
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
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue placeholder="Pilih provinsi" />
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
                                        <InputError
                                            message={form.errors.province_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Kota / Kabupaten</Label>
                                        <Select
                                            value={
                                                form.data.regency_id ||
                                                undefined
                                            }
                                            onValueChange={(v) => {
                                                form.setData((d: any) => ({
                                                    ...d,
                                                    regency_id: v,
                                                    district_id: '',
                                                    village_id: '',
                                                }));
                                            }}
                                            disabled={
                                                !form.data.province_id ||
                                                loadingRegencies
                                            }
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue
                                                    placeholder={
                                                        loadingRegencies
                                                            ? 'Memuat...'
                                                            : form.data
                                                                    .province_id
                                                              ? 'Pilih kota / kabupaten'
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
                                        <InputError
                                            message={form.errors.regency_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Kecamatan</Label>
                                        <Select
                                            value={
                                                form.data.district_id ||
                                                undefined
                                            }
                                            onValueChange={(v) => {
                                                form.setData((d: any) => ({
                                                    ...d,
                                                    district_id: v,
                                                    village_id: '',
                                                }));
                                            }}
                                            disabled={
                                                !form.data.regency_id ||
                                                loadingDistricts
                                            }
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue
                                                    placeholder={
                                                        loadingDistricts
                                                            ? 'Memuat...'
                                                            : form.data
                                                                    .regency_id
                                                              ? 'Pilih kecamatan'
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
                                        <InputError
                                            message={form.errors.district_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Kelurahan / Desa</Label>
                                        <Select
                                            value={
                                                form.data.village_id ||
                                                undefined
                                            }
                                            onValueChange={(v) =>
                                                form.setData('village_id', v)
                                            }
                                            disabled={
                                                !form.data.district_id ||
                                                loadingVillages
                                            }
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue
                                                    placeholder={
                                                        loadingVillages
                                                            ? 'Memuat...'
                                                            : form.data
                                                                    .district_id
                                                              ? 'Pilih kelurahan / desa'
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
                                        <InputError
                                            message={form.errors.village_id}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Alamat Lengkap</Label>
                                    <Textarea
                                        id="address"
                                        value={form.data.address}
                                        onChange={(e) =>
                                            form.setData(
                                                'address',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Jl. / RT RW / patokan alamat domisili"
                                        rows={3}
                                        className="resize-none"
                                    />
                                    <InputError
                                        message={form.errors.address}
                                    />
                                </div>

                                {/* Action bar */}
                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                        className="sm:w-auto"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        form="biodata-form"
                                        disabled={form.processing}
                                        className="bg-[#17524A] text-white hover:bg-[#12423b] sm:w-auto"
                                    >
                                        {form.processing ? (
                                            'Menyimpan...'
                                        ) : (
                                            <>
                                                <Save className="mr-2 size-4" />{' '}
                                                Simpan Biodata
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar checklist */}
                    <div className="space-y-6">
                        <Card className="rounded-2xl border-[#E5BE1E]/30 bg-amber-50/60 shadow-sm dark:bg-amber-950/20">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="size-4 text-amber-700 dark:text-amber-400" />
                                    <CardTitle className="text-sm font-bold">
                                        Checklist Kelengkapan
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2.5">
                                {Object.entries(completeness.fields).map(
                                    ([key, done]) => (
                                        <div
                                            key={key}
                                            className="flex items-center gap-2.5 text-sm"
                                        >
                                            {done ? (
                                                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                                            ) : (
                                                <CircleAlert className="size-4 shrink-0 text-amber-500" />
                                            )}
                                            <span
                                                className={
                                                    done
                                                        ? 'text-foreground'
                                                        : 'font-medium text-amber-800 dark:text-amber-300'
                                                }
                                            >
                                                {labelField(key)}
                                            </span>
                                            {done && (
                                                <span className="ml-auto text-xs text-emerald-700">
                                                    Terisi
                                                </span>
                                            )}
                                        </div>
                                    ),
                                )}
                                {!completeness.is_complete && (
                                    <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
                                        Tips: lengkapi NIK, tempat/tanggal lahir,
                                        dan alamat domisili agar sinkronisasi
                                        Penyaluran akurat.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <CircleUser className="size-4 text-[#17524A]" />
                                    <CardTitle className="text-sm font-bold">
                                        Kontak Terdaftar
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
                                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                                        <Mail className="size-3.5" /> Email
                                    </span>
                                    <span className="max-w-[160px] truncate font-medium">
                                        {initial.email ?? '-'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
                                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                                        <Phone className="size-3.5" /> HP
                                    </span>
                                    <span className="font-medium">
                                        {initial.phone ?? '-'}
                                    </span>
                                </div>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Email & HP berasal dari akun Penyaluran.
                                    Hubungi admin jika perlu perubahan.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function labelField(key: string): string {
    const map: Record<string, string> = {
        name: 'Nama Lengkap',
        nik: 'NIK',
        gender: 'Jenis Kelamin',
        birth_place: 'Tempat Lahir',
        birth_date: 'Tanggal Lahir',
        address: 'Alamat',
        province_id: 'Provinsi',
        regency_id: 'Kabupaten/Kota',
        district_id: 'Kecamatan',
        village_id: 'Kelurahan/Desa',
    };

    return map[key] ?? key;
}

GuruBiodata.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/teacher/dashboard' },
        { title: 'Biodata', href: '/teacher/biodata' },
    ],
};
