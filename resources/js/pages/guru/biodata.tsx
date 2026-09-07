import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type Option = { id: number | string; name: string };
type Regency = { id: number | string; province_id: number | string; name: string };
type District = { id: number | string; regency_id: number | string; name: string };
type Village = { id: number | string; district_id: number | string; name: string };

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
};

export default function GuruBiodata() {
    const { biodata: initial, provinces } = usePage<PageProps>().props;

    const form = useForm({
        name: initial.name ?? '',
        nik: initial.nik ?? '',
        gender: (initial.gender as '' | 'male' | 'female') ?? '',
        birth_place: initial.birth_place ?? '',
        birth_date: initial.birth_date ?? '',
        address: initial.address ?? '',
        province_id: String(initial.province_id ?? ''),
        regency_id: String(initial.regency_id ?? ''),
        district_id: String(initial.district_id ?? ''),
        village_id: String(initial.village_id ?? ''),
    });

    const [regencies, setRegencies] = useState<Regency[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);
    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    // Fetch regencies when province changes
    useEffect(() => {
        const pid = form.data.province_id;
        if (!pid) {
            setRegencies([]);
            return;
        }
        setLoadingRegencies(true);
        fetch(`/regions/regencies?province_id=${encodeURIComponent(pid)}`, { headers: { Accept: 'application/json' } })
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
        setLoadingDistricts(true);
        fetch(`/regions/districts?regency_id=${encodeURIComponent(rid)}`, { headers: { Accept: 'application/json' } })
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
        setLoadingVillages(true);
        fetch(`/regions/villages?district_id=${encodeURIComponent(did)}`, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => setVillages(p.data ?? []))
            .catch(() => setVillages([]))
            .finally(() => setLoadingVillages(false));
    }, [form.data.district_id]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.put('/guru/biodata', {
            preserveScroll: true,
        });
    };

    const completeness = initial.completeness;

    return (
        <>
            <Head title="Biodata Guru" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                <Card className="rounded-3xl p-5 lg:p-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">Biodata Guru</h1>
                        <p className="text-sm text-muted-foreground">Lengkapi biodata agar data guru valid dan sinkron dengan Penyaluran.</p>
                        <div className="mt-2 flex items-center gap-3">
                            <Progress value={completeness.percent} className="h-2 flex-1" />
                            <Badge variant={completeness.is_complete ? 'default' : 'secondary'}>{completeness.percent}%</Badge>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-3xl p-5 lg:p-6">
                    <div className="mb-4 grid gap-2 rounded-xl bg-muted/40 p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{initial.email ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">HP</span>
                            <span className="font-medium">{initial.phone ?? '-'}</span>
                        </div>
                        {initial.photo_url && (
                            <div className="mt-2">
                                <p className="text-xs text-muted-foreground">Foto saat ini</p>
                                <img src={initial.photo_url} alt="Foto Guru" className="mt-2 size-20 rounded-xl object-cover" />
                            </div>
                        )}
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap *</Label>
                            <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nik">NIK (10-20 digit)</Label>
                            <Input id="nik" value={form.data.nik} onChange={(e) => form.setData('nik', e.target.value)} placeholder="3201..." />
                            <InputError message={form.errors.nik} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Jenis Kelamin</Label>
                            <Select value={form.data.gender} onValueChange={(v) => form.setData('gender', v as any)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Laki-laki</SelectItem>
                                    <SelectItem value="female">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.gender} />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="birth_place">Tempat Lahir</Label>
                                <Input id="birth_place" value={form.data.birth_place} onChange={(e) => form.setData('birth_place', e.target.value)} />
                                <InputError message={form.errors.birth_place} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="birth_date">Tanggal Lahir</Label>
                                <Input id="birth_date" type="date" value={form.data.birth_date} onChange={(e) => form.setData('birth_date', e.target.value)} />
                                <InputError message={form.errors.birth_date} />
                            </div>
                        </div>

                        {/* Wilayah bertingkat */}
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Provinsi</Label>
                                <Select
                                    value={form.data.province_id}
                                    onValueChange={(v) => {
                                        form.setData((d: any) => ({ ...d, province_id: v, regency_id: '', district_id: '', village_id: '' }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih provinsi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map((p) => (
                                            <SelectItem key={String(p.id)} value={String(p.id)}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.province_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Kota / Kabupaten</Label>
                                <Select
                                    value={form.data.regency_id}
                                    onValueChange={(v) => {
                                        form.setData((d: any) => ({ ...d, regency_id: v, district_id: '', village_id: '' }));
                                    }}
                                    disabled={!form.data.province_id || loadingRegencies}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingRegencies ? 'Memuat...' : 'Pilih kota / kabupaten'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regencies.map((r) => (
                                            <SelectItem key={String(r.id)} value={String(r.id)}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.regency_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Kecamatan</Label>
                                <Select
                                    value={form.data.district_id}
                                    onValueChange={(v) => {
                                        form.setData((d: any) => ({ ...d, district_id: v, village_id: '' }));
                                    }}
                                    disabled={!form.data.regency_id || loadingDistricts}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingDistricts ? 'Memuat...' : 'Pilih kecamatan'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {districts.map((d) => (
                                            <SelectItem key={String(d.id)} value={String(d.id)}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.district_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Kelurahan / Desa</Label>
                                <Select
                                    value={form.data.village_id}
                                    onValueChange={(v) => form.setData('village_id', v)}
                                    disabled={!form.data.district_id || loadingVillages}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingVillages ? 'Memuat...' : 'Pilih kelurahan / desa'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {villages.map((v) => (
                                            <SelectItem key={String(v.id)} value={String(v.id)}>
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.village_id} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea id="address" value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} rows={3} />
                            <InputError message={form.errors.address} />
                        </div>

                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Menyimpan...' : <><Save className="mr-2 size-4" /> Simpan Biodata</>}
                        </Button>
                    </form>
                </Card>
            </div>
        </>
    );
}

GuruBiodata.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/guru/dashboard' },
        { title: 'Biodata', href: '/guru/biodata' },
    ],
};
