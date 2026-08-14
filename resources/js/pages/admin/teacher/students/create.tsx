import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import teacherStudents from '@/routes/admin/teacher/students';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent, ReactNode} from 'react';
import { useMemo } from 'react';

type Option = {
    id: number | string;
    name: string;
    category?: string;
    slug?: string;
};
type Regency = { id: string; province_id: string; name: string };

export default function CreatePage() {
    const {
        olimpiades = [],
        provinces = [],
        regencies = [],
    } = usePage<{
        olimpiades?: Option[];
        provinces?: Option[];
        regencies?: Regency[];
    }>().props;

    const form = useForm<any>({
        nik: '',
        olimpiade_id: '',
        full_name: '',
        nickname: '',
        gender: '',
        birth_place: '',
        birth_date: '',
        age: '',
        school_name: '',
        grade: '',
        address: '',
        province_id: '',
        regency_id: '',
        parent_phone: '',
        mentor_name: '',
        mentor_phone: '',
        achievements: '',
        photo: null,
        identity_card: null,
        family_card: null,
    });

    const filteredRegencies = useMemo(
        () =>
            regencies.filter(
                (regency) =>
                    String(regency.province_id) ===
                    String(form.data.province_id),
            ),
        [form.data.province_id, regencies],
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(teacherStudents.store().url, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const error = (name: string) =>
        form.errors[name] ? (
            <p className="text-sm font-medium text-destructive">
                {form.errors[name]}
            </p>
        ) : null;

    return (
        <form onSubmit={submit} className="space-y-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Daftarkan Siswa</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Form pendaftaran siswa baru oleh guru
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft />
                        Kembali
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Save />
                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </div>

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-bold">Data Peserta</h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="NIK (16 digit)" error={error('nik')}>
                        <Input
                            value={form.data.nik}
                            onChange={(e) =>
                                form.setData(
                                    'nik',
                                    e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 16),
                                )
                            }
                            required
                            maxLength={16}
                            placeholder="16 digit NIK"
                        />
                    </Field>
                    <Field label="Nama Lengkap" error={error('full_name')}>
                        <Input
                            value={form.data.full_name}
                            onChange={(e) =>
                                form.setData('full_name', e.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field label="Nama Panggilan" error={error('nickname')}>
                        <Input
                            value={form.data.nickname}
                            onChange={(e) =>
                                form.setData('nickname', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="Jenis Kelamin" error={error('gender')}>
                        <Select
                            value={form.data.gender}
                            onChange={(value) => form.setData('gender', value)}
                            options={[
                                { value: 'male', label: 'Laki-laki' },
                                { value: 'female', label: 'Perempuan' },
                            ]}
                        />
                    </Field>
                    <Field label="Tempat Lahir" error={error('birth_place')}>
                        <Input
                            value={form.data.birth_place}
                            onChange={(e) =>
                                form.setData('birth_place', e.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field label="Tanggal Lahir" error={error('birth_date')}>
                        <Input
                            type="date"
                            value={form.data.birth_date}
                            onChange={(e) =>
                                form.setData('birth_date', e.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field label="Usia" error={error('age')}>
                        <Input
                            type="number"
                            value={form.data.age}
                            onChange={(e) =>
                                form.setData('age', e.target.value)
                            }
                            required
                            min={5}
                            max={20}
                        />
                    </Field>
                    <Field label="Kelas" error={error('grade')}>
                        <Input
                            value={form.data.grade}
                            onChange={(e) =>
                                form.setData('grade', e.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field label="Nama Sekolah" error={error('school_name')}>
                        <Input
                            value={form.data.school_name}
                            onChange={(e) =>
                                form.setData('school_name', e.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field
                        label="HP Orang Tua/Wali"
                        error={error('parent_phone')}
                    >
                        <Input
                            value={form.data.parent_phone}
                            onChange={(e) =>
                                form.setData('parent_phone', e.target.value)
                            }
                            required
                        />
                    </Field>
                </div>
                <Field label="Alamat" error={error('address')}>
                    <Textarea
                        rows={3}
                        value={form.data.address}
                        onChange={(e) =>
                            form.setData('address', e.target.value)
                        }
                        required
                    />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Provinsi" error={error('province_id')}>
                        <Select
                            value={form.data.province_id}
                            onChange={(value) => {
                                form.setData('province_id', value);
                                form.setData('regency_id', '');
                            }}
                            options={provinces.map((item) => ({
                                value: String(item.id),
                                label: item.name,
                            }))}
                        />
                    </Field>
                    <Field label="Kota/Kabupaten" error={error('regency_id')}>
                        <Select
                            value={form.data.regency_id}
                            onChange={(value) =>
                                form.setData('regency_id', value)
                            }
                            options={filteredRegencies.map((item) => ({
                                value: item.id,
                                label: item.name,
                            }))}
                        />
                    </Field>
                </div>
            </Card>

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-bold">Kategori dan Dokumen</h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Kategori Lomba" error={error('olimpiade_id')}>
                        <Select
                            value={form.data.olimpiade_id}
                            onChange={(value) =>
                                form.setData('olimpiade_id', value)
                            }
                            options={olimpiades.map((item) => ({
                                value: String(item.id),
                                label: item.name,
                            }))}
                        />
                    </Field>
                    <Field label="Nama Pendamping" error={error('mentor_name')}>
                        <Input
                            value={form.data.mentor_name}
                            onChange={(e) =>
                                form.setData('mentor_name', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="HP Pendamping" error={error('mentor_phone')}>
                        <Input
                            value={form.data.mentor_phone}
                            onChange={(e) =>
                                form.setData('mentor_phone', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="Foto" error={error('photo')}>
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            required
                            onChange={(e) =>
                                form.setData('photo', e.target.files?.[0] ?? null)
                            }
                        />
                    </Field>
                    <Field label="Kartu Identitas (KTP/Akta)" error={error('identity_card')}>
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            required
                            onChange={(e) =>
                                form.setData('identity_card', e.target.files?.[0] ?? null)
                            }
                        />
                    </Field>
                    <Field label="Kartu Keluarga (KK)" error={error('family_card')}>
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            required
                            onChange={(e) =>
                                form.setData('family_card', e.target.files?.[0] ?? null)
                            }
                        />
                    </Field>
                </div>
                <Field label="Prestasi" error={error('achievements')}>
                    <Textarea
                        rows={4}
                        value={form.data.achievements}
                        onChange={(e) =>
                            form.setData('achievements', e.target.value)
                        }
                    />
                </Field>
            </Card>
        </form>
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
    <div className="space-y-2">
        <Label>{label}</Label>
        {children}
        {error}
    </div>
);

const Select = ({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}) => (
    <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        required
    >
        <option value="">Pilih data</option>
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);

CreatePage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Siswa',
            href: teacherStudents.index().url,
        },
        {
            title: 'Daftarkan Siswa',
            href: teacherStudents.create().url,
        },
    ],
};
