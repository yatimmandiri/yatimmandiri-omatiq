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
import { dashboard } from '@/routes/teacher';
import binaan from '@/routes/teacher/data-binaan';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, GraduationCap, MapPin, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

export default function CreatePage() {
    const {
        provinces = [],
        regencies = [],
        districts = [],
        villages: initialVillages = [],
    } = usePage<any>().props;
    const form = useForm<any>({
        nik: '',
        full_name: '',
        gender: 'male',
        birth_date: '',
        school_name: '',
        grade: '',
        address: '',
        province_id: '',
        regency_id: '',
        district_id: '',
        village_id: '',
    });
    const [villages, setVillages] = useState<any[]>(initialVillages);
    const [isLoadingVillages, setIsLoadingVillages] = useState(false);

    const [districtsFiltered, setDistrictsFiltered] = useState<any[]>([]);
    const [regenciesFiltered, setRegenciesFiltered] = useState<any[]>([]);

    useEffect(() => {
        if (!form.data.province_id) {
            setRegenciesFiltered([]);

            return;
        }

        setRegenciesFiltered(
            regencies.filter(
                (r: any) => String(r.province_id) === String(form.data.province_id),
            ),
        );
    }, [form.data.province_id, regencies]);

    useEffect(() => {
        if (!form.data.regency_id) {
            setDistrictsFiltered([]);

            return;
        }

        setDistrictsFiltered(
            districts.filter(
                (r: any) => String(r.regency_id) === String(form.data.regency_id),
            ),
        );
    }, [form.data.regency_id, districts]);

    useEffect(() => {
        const districtId = form.data.district_id;

        if (!districtId) {
return;
}

        const controller = new AbortController();
        setIsLoadingVillages(true);
        fetch(
            `/regions/villages?district_id=${encodeURIComponent(districtId)}`,
            {
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            },
        )
            .then((response) => (response.ok ? response.json() : { data: [] }))
            .then((payload) => setVillages(payload.data ?? []))
            .catch((fetchError) => {
                if (fetchError.name !== 'AbortError') {
setVillages([]);
}
            })
            .finally(() => {
                if (!controller.signal.aborted) {
setIsLoadingVillages(false);
}
            });

        return () => controller.abort();
    }, [form.data.district_id]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(binaan.store().url);
    };
    const error = (n: string) =>
        form.errors[n] ? (
            <p className="text-xs font-medium text-destructive">{form.errors[n]}</p>
        ) : null;

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9 shrink-0 rounded-xl"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Tambah Binaan</h1>
                        <p className="text-sm text-muted-foreground">
                            Tambah santri binaan baru — akan tersimpan lokal dan disinkronkan ke Penyaluran.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="rounded-2xl border-[#E5BE1E]/30 bg-amber-50/60 px-4 py-3 dark:bg-amber-950/20">
                <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                    <span className="font-semibold">Catatan:</span> Idealnya binaan berasal dari Penyaluran. Form ini untuk kasus khusus / testing lokal. NIK wajib 16 digit & unik untuk binaan.
                </p>
            </Card>

            <form onSubmit={submit} className="space-y-6">
                {/* Data Diri */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A]/10 text-[#17524A]">
                                <User className="size-4" />
                            </span>
                            <CardTitle className="text-base">Data Diri</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="NIK (16 digit) *" error={error('nik')}>
                                <Input
                                    value={form.data.nik}
                                    onChange={(e) =>
                                        form.setData(
                                            'nik',
                                            e.target.value.replace(/\D/g, '').slice(0, 16),
                                        )
                                    }
                                    placeholder="3201xxxxxxxxxxxx"
                                    maxLength={16}
                                    inputMode="numeric"
                                    required
                                    className="h-10 font-mono"
                                />
                            </Field>
                            <Field label="Jenis Kelamin *" error={error('gender')}>
                                <Select
                                    value={form.data.gender}
                                    onValueChange={(v) => form.setData('gender', v)}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue placeholder="Pilih gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Laki-laki</SelectItem>
                                        <SelectItem value="female">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                        <Field label="Nama Lengkap *" error={error('full_name')}>
                            <Input
                                value={form.data.full_name}
                                onChange={(e) => form.setData('full_name', e.target.value)}
                                placeholder="Nama lengkap santri"
                                required
                                className="h-10"
                            />
                        </Field>
                        <Field label="Tanggal Lahir *" error={error('birth_date')}>
                            <Input
                                type="date"
                                value={form.data.birth_date}
                                onChange={(e) => form.setData('birth_date', e.target.value)}
                                required
                                className="h-10"
                            />
                        </Field>
                    </CardContent>
                </Card>

                {/* Sekolah */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400">
                                <GraduationCap className="size-4" />
                            </span>
                            <CardTitle className="text-base">Pendidikan</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Sekolah *" error={error('school_name')}>
                            <Input
                                value={form.data.school_name}
                                onChange={(e) => form.setData('school_name', e.target.value)}
                                placeholder="Nama sekolah asal"
                                required
                                className="h-10"
                            />
                        </Field>
                        <Field label="Kelas *" error={error('grade')}>
                            <Input
                                value={form.data.grade}
                                onChange={(e) => form.setData('grade', e.target.value)}
                                placeholder="Contoh: 4 / IV"
                                required
                                className="h-10"
                            />
                        </Field>
                    </CardContent>
                </Card>

                {/* Domisili */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                <MapPin className="size-4" />
                            </span>
                            <CardTitle className="text-base">Domisili & Alamat</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field label="Alamat Lengkap *" error={error('address')}>
                            <Textarea
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                placeholder="Jl. / RT RW / patokan alamat"
                                rows={3}
                                required
                                className="resize-none"
                            />
                        </Field>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Provinsi *" error={error('province_id')}>
                                <Select
                                    value={form.data.province_id || undefined}
                                    onValueChange={(v) => {
                                        form.setData('province_id', v);
                                        form.setData('regency_id', '');
                                        form.setData('district_id', '');
                                        form.setData('village_id', '');
                                        setVillages([]);
                                    }}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue placeholder="Pilih provinsi" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {provinces.map((p: any) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Kabupaten / Kota *" error={error('regency_id')}>
                                <Select
                                    value={form.data.regency_id || undefined}
                                    onValueChange={(v) => {
                                        form.setData('regency_id', v);
                                        form.setData('district_id', '');
                                        form.setData('village_id', '');
                                        setVillages([]);
                                    }}
                                    disabled={!form.data.province_id}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue
                                            placeholder={
                                                !form.data.province_id
                                                    ? 'Pilih provinsi dahulu'
                                                    : 'Pilih kabupaten / kota'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {regenciesFiltered.map((r: any) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
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
                                        form.setData('district_id', v);
                                        form.setData('village_id', '');

                                        if (!v) {
setVillages([]);
}
                                    }}
                                    disabled={!form.data.regency_id}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue
                                            placeholder={
                                                !form.data.regency_id
                                                    ? 'Pilih kabupaten dahulu'
                                                    : 'Pilih kecamatan'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {districtsFiltered.map((r: any) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Kelurahan / Desa" error={error('village_id')}>
                                <Select
                                    value={form.data.village_id || undefined}
                                    onValueChange={(v) => form.setData('village_id', v)}
                                    disabled={!form.data.district_id || isLoadingVillages}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue
                                            placeholder={
                                                isLoadingVillages
                                                    ? 'Memuat...'
                                                    : !form.data.district_id
                                                      ? 'Pilih kecamatan dahulu'
                                                      : 'Pilih kelurahan / desa'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {villages
                                            .filter(
                                                (r: any) =>
                                                    String(r.district_id) === String(form.data.district_id),
                                            )
                                            .map((r: any) => (
                                                <SelectItem key={r.id} value={String(r.id)}>
                                                    {r.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="bg-[#17524A] text-white hover:bg-[#12423b]"
                    >
                        <Save className="size-4" />
                        {form.processing ? 'Menyimpan...' : 'Simpan Binaan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
const Field = ({
    label,
    children,
    error,
}: {
    label: string;
    children: ReactNode;
    error?: ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label className="text-sm font-medium">{label}</Label>
        {children}
        {error}
    </div>
);
CreatePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Binaan', href: binaan.index().url },
        { title: 'Tambah', href: binaan.create().url },
    ],
};
