import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import teacherStudents from '@/routes/admin/teacher/students';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, ReactNode, useMemo } from 'react';

type Option = {
    id: number | string;
    name: string;
    category?: string;
    slug?: string;
};
type Regency = { id: string; province_id: string; name: string };

const programOptions = [
    { value: 'sanggar_genius', label: 'Sanggar Genius' },
    { value: 'sanggar_alquran', label: "Sanggar Al-Qur'an" },
    { value: 'asrama_yatim_mandiri', label: 'Asrama Yatim Mandiri' },
    { value: 'other', label: 'Program Lainnya' },
];

const educationOptions = [
    { value: 'SD/MI', label: 'SD/MI' },
    { value: 'SMP/MTs', label: 'SMP/MTs' },
];

const dateValue = (value?: string | null) => value?.slice(0, 10) ?? '';

export default function EditPage() {
    const {
        participant,
        olimpiades = [],
        provinces = [],
        regencies = [],
    } = usePage<{
        participant: Record<string, any>;
        olimpiades?: Option[];
        provinces?: Option[];
        regencies?: Regency[];
    }>().props;

    const form = useForm<any>({
        nik: participant?.nik ?? '',
        olimpiade_id: participant?.olimpiade_id
            ? String(participant.olimpiade_id)
            : '',
        full_name: participant?.full_name ?? '',
        nickname: participant?.nickname ?? '',
        gender: participant?.gender ?? '',
        birth_place: participant?.birth_place ?? '',
        birth_date: dateValue(participant?.birth_date),
        age: participant?.age ?? '',
        education_level: participant?.education_level ?? '',
        school_name: participant?.school_name ?? '',
        grade: participant?.grade ?? '',
        address: participant?.address ?? '',
        province_id: participant?.province_id ?? '',
        regency_id: participant?.regency_id ?? '',
        parent_phone: participant?.parent_phone ?? '',
        development_program: participant?.development_program ?? '',
        development_program_other: participant?.development_program_other ?? '',
        institution_name: participant?.institution_name ?? '',
        branch_office: participant?.branch_office ?? '',
        mentor_name: participant?.mentor_name ?? '',
        mentor_phone: participant?.mentor_phone ?? '',
        achievements: participant?.achievements ?? '',
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

    form.transform((data: any) => ({
        ...data,
        _method: 'put',
    }));

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(teacherStudents.update(participant.id).url, {
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
                    <h1 className="text-2xl font-bold">Edit Siswa</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {participant.registration_number} -{' '}
                        {participant.full_name}
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
                    <Field label="Jenjang" error={error('education_level')}>
                        <Select
                            value={form.data.education_level}
                            onChange={(value) =>
                                form.setData('education_level', value)
                            }
                            options={educationOptions}
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
                <h2 className="text-lg font-bold">Program dan Kategori</h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field
                        label="Program Binaan"
                        error={error('development_program')}
                    >
                        <Select
                            value={form.data.development_program}
                            onChange={(value) =>
                                form.setData('development_program', value)
                            }
                            options={programOptions}
                        />
                    </Field>
                    {form.data.development_program === 'other' && (
                        <Field
                            label="Program Lainnya"
                            error={error('development_program_other')}
                        >
                            <Input
                                value={form.data.development_program_other}
                                onChange={(e) =>
                                    form.setData(
                                        'development_program_other',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                    )}
                    <Field
                        label="Nama Sanggar / Asrama"
                        error={error('institution_name')}
                    >
                        <Input
                            value={form.data.institution_name}
                            onChange={(e) =>
                                form.setData('institution_name', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Kantor Layanan / Cabang"
                        error={error('branch_office')}
                    >
                        <Input
                            value={form.data.branch_office}
                            onChange={(e) =>
                                form.setData('branch_office', e.target.value)
                            }
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
