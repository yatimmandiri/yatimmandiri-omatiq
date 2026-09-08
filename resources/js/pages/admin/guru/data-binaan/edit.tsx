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
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import binaanRoutes from '@/routes/admin/guru/data-binaan';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, GraduationCap, MapPin, Save, User } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo } from 'react';

type Option = { id: number | string; name: string };
type Regency = { id: string; province_id: string; name: string };

const dateValue = (value?: string | null) =>
    value ? String(value).slice(0, 10) : '';

export default function EditPage() {
    const {
        binaan: student,
        provinces = [],
        regencies = [],
    } = usePage<{
        binaan: Record<string, any>;
        provinces?: Option[];
        regencies?: Regency[];
    }>().props;

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
        parent_phone: student.parent_phone ?? student.guardian_phone ?? '',
    });

    form.transform((data: any) => ({
        ...data,
        _method: 'put',
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
        form.post(binaanRoutes.update(student.id).url);
    };

    const error = (field: string) =>
        form.errors[field] ? (
            <p className="text-xs font-medium text-destructive">
                {form.errors[field]}
            </p>
        ) : null;

    return (
        <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit Data Binaan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pembaruan data santri ini akan langsung disinkronkan ke
                        server Penyaluran.
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
                        Informasi identitas santri binaan.
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
                            label="NIK (Nomor Induk Kependudukan)"
                            error={error('nik')}
                        >
                            <Input
                                value={form.data.nik}
                                onChange={(e) =>
                                    form.setData('nik', e.target.value)
                                }
                                placeholder="16 digit NIK"
                                maxLength={16}
                            />
                        </Field>

                        <Field label="NIS" error={error('nis')}>
                            <Input
                                value={form.data.nis}
                                onChange={(e) =>
                                    form.setData('nis', e.target.value)
                                }
                                placeholder="Nomor induk siswa (opsional)"
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
                                placeholder="Tempat lahir"
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

                        <Field
                            label="No. HP / WhatsApp Wali"
                            error={error('parent_phone')}
                        >
                            <Input
                                value={form.data.parent_phone}
                                onChange={(e) =>
                                    form.setData('parent_phone', e.target.value)
                                }
                                placeholder="08xxxxxxxxxx"
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
                            <select
                                value={form.data.province_id}
                                onChange={(e) => {
                                    form.setData('province_id', e.target.value);
                                    form.setData('regency_id', '');
                                }}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-ring focus:outline-none"
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
                            label="Kabupaten / Kota"
                            error={error('regency_id')}
                        >
                            <select
                                value={form.data.regency_id}
                                onChange={(e) =>
                                    form.setData('regency_id', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-ring focus:outline-none"
                                disabled={!form.data.province_id}
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
