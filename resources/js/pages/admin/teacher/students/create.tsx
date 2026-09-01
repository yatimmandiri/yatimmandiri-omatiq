import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import teacherStudents from '@/routes/admin/teacher/students';
import { useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    GraduationCap,
    Save,
    School,
    UserRound,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

type Option = {
    id: number | string;
    name: string;
    category?: string;
};

type RosterStudent = {
    id: number | string;
    nik: string;
    full_name: string;
    school_name?: string | null;
    school_level?: string | null;
    grade?: string | null;
    birth_date?: string | null;
    address?: string | null;
    guardian_name?: string | null;
    guardian_phone?: string | null;
    sanggar_id?: number | string | null;
    sanggar_name?: string | null;
    kantor_name?: string | null;
};

export default function CreatePage() {
    const {
        olimpiades = [],
        students = [],
        sanggars = [],
        preselected_student_id = null,
        selected_sanggar_id = null,
    } = usePage<{
        olimpiades?: Option[];
        students?: RosterStudent[];
        sanggars?: Array<{ id: number | string; name: string; type?: string }>;
        preselected_student_id?: number | string | null;
        selected_sanggar_id?: number | string | null;
    }>().props;

    const selectedStudent =
        students.find(
            (item) => String(item.id) === String(preselected_student_id),
        ) ?? students[0];

    const selectedSanggarId =
        selected_sanggar_id ?? selectedStudent?.sanggar_id ?? '';

    const form = useForm({
        penyaluran_student_id: selectedStudent ? String(selectedStudent.id) : '',
        penyaluran_sanggar_id: selectedSanggarId ? String(selectedSanggarId) : '',
        olimpiade_id: '',
        achievements: '',
        notes: '',
    });

    const activeStudent =
        students.find(
            (item) => String(item.id) === form.data.penyaluran_student_id,
        ) ?? null;

    const activeSanggar =
        sanggars.find(
            (item) => String(item.id) === form.data.penyaluran_sanggar_id,
        ) ?? null;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(teacherStudents.store().url, {
            preserveScroll: true,
        });
    };

    const error = (name: keyof typeof form.data | string) =>
        form.errors[name] ? (
            <p className="text-sm font-medium text-destructive">
                {form.errors[name]}
            </p>
        ) : null;

    return (
        <form
            onSubmit={submit}
            className="mx-auto w-full max-w-5xl space-y-6 p-4 lg:p-6"
        >
            <div className="flex flex-col gap-4 rounded-3xl border bg-gradient-to-br from-orange-50 via-background to-sky-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:p-7">
                <div className="max-w-2xl">
                    <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        <CheckCircle2 className="size-4" />
                        Form singkat guru
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                        Daftarkan Binaan ke OMATIQ
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Data binaan diambil otomatis dari Penyaluran. Guru cukup
                        memilih kategori olimpiade, lalu menambahkan prestasi
                        atau catatan bila diperlukan.
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
                    <Button
                        type="submit"
                        disabled={
                            form.processing ||
                            students.length === 0 ||
                            !form.data.penyaluran_student_id
                        }
                    >
                        <Save />
                        {form.processing ? 'Menyimpan...' : 'Daftarkan'}
                    </Button>
                </div>
            </div>

            {students.length === 0 && (
                <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
                    Belum ada binaan yang dapat didaftarkan dari Penyaluran.
                    Pastikan akun guru terhubung dan data binaan tersedia.
                </div>
            )}

            {students.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card className="space-y-5 rounded-3xl p-5 shadow-sm lg:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                                <UserRound className="size-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">
                                    Data Binaan
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Pilih binaan yang akan didaftarkan.
                                </p>
                            </div>
                        </div>

                        <Field
                            label="Binaan"
                            error={error('penyaluran_student_id')}
                        >
                            <Select
                                value={form.data.penyaluran_student_id}
                                onChange={(value) => {
                                    const next = students.find(
                                        (item) => String(item.id) === value,
                                    );

                                    form.setData((data) => ({
                                        ...data,
                                        penyaluran_student_id: value,
                                        penyaluran_sanggar_id:
                                            data.penyaluran_sanggar_id ||
                                            (next?.sanggar_id
                                                ? String(next.sanggar_id)
                                                : ''),
                                    }));
                                }}
                                placeholder="Pilih binaan"
                                options={students.map((item) => ({
                                    value: String(item.id),
                                    label: `${item.full_name} - ${item.nik}`,
                                }))}
                            />
                        </Field>

                        {sanggars.length > 0 && (
                            <Field
                                label="Sanggar"
                                error={error('penyaluran_sanggar_id')}
                            >
                                <Select
                                    value={form.data.penyaluran_sanggar_id}
                                    onChange={(value) =>
                                        form.setData(
                                            'penyaluran_sanggar_id',
                                            value,
                                        )
                                    }
                                    placeholder="Pilih sanggar"
                                    options={sanggars.map((item) => ({
                                        value: String(item.id),
                                        label: `${item.name}${item.type ? ` (${item.type})` : ''}`,
                                    }))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Biasanya sudah otomatis dari tombol
                                    pendaftaran di daftar binaan.
                                </p>
                            </Field>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            <InfoCard
                                icon={<School className="size-5" />}
                                label="Sekolah"
                                value={[
                                    activeStudent?.school_name,
                                    activeStudent?.school_level,
                                    activeStudent?.grade
                                        ? `Kelas ${activeStudent.grade}`
                                        : null,
                                ]
                                    .filter(Boolean)
                                    .join(' - ')}
                            />
                            <InfoCard
                                icon={<GraduationCap className="size-5" />}
                                label="Sanggar"
                                value={
                                    activeStudent?.sanggar_name ??
                                    activeSanggar?.name
                                }
                            />
                            <InfoCard
                                label="Tanggal Lahir"
                                value={activeStudent?.birth_date?.slice(0, 10)}
                            />
                            <InfoCard
                                label="Wali"
                                value={[
                                    activeStudent?.guardian_name,
                                    activeStudent?.guardian_phone,
                                ]
                                    .filter(Boolean)
                                    .join(' - ')}
                            />
                            <InfoCard
                                className="sm:col-span-2"
                                label="Alamat"
                                value={activeStudent?.address}
                            />
                        </div>
                    </Card>

                    <Card className="space-y-5 rounded-3xl p-5 shadow-sm lg:p-6">
                        <div>
                            <h2 className="text-lg font-bold">
                                Pilihan Olimpiade
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Satu binaan hanya dapat memiliki satu
                                pendaftaran aktif pada tahun event yang sama.
                            </p>
                        </div>

                        <Field
                            label="Kategori Olimpiade"
                            error={error('olimpiade_id')}
                        >
                            <Select
                                value={form.data.olimpiade_id}
                                onChange={(value) =>
                                    form.setData('olimpiade_id', value)
                                }
                                placeholder="Pilih kategori"
                                options={olimpiades.map((item) => ({
                                    value: String(item.id),
                                    label: item.name,
                                }))}
                            />
                        </Field>

                        <Field
                            label="Prestasi / Pengalaman (opsional)"
                            error={error('achievements')}
                        >
                            <textarea
                                value={form.data.achievements}
                                onChange={(event) =>
                                    form.setData(
                                        'achievements',
                                        event.target.value,
                                    )
                                }
                                placeholder="Contoh: Juara kelas, hafalan juz, atau lomba yang pernah diikuti"
                                className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                rows={4}
                            />
                        </Field>

                        <Field
                            label="Catatan Guru (opsional)"
                            error={error('notes')}
                        >
                            <textarea
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData('notes', event.target.value)
                                }
                                placeholder="Catatan singkat untuk admin, bila ada"
                                className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                rows={3}
                            />
                        </Field>

                        <div className="rounded-2xl bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
                            Dengan menekan tombol daftar, guru menyatakan data
                            binaan dari Penyaluran sudah dipilih sesuai anak
                            yang akan mengikuti OMATIQ.
                        </div>
                    </Card>
                </div>
            )}
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

const InfoCard = ({
    icon,
    label,
    value,
    className = '',
}: {
    icon?: ReactNode;
    label: string;
    value?: string | null;
    className?: string;
}) => (
    <div className={`rounded-2xl border bg-muted/30 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {icon}
            {label}
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">
            {value || 'Belum tersedia dari Penyaluran'}
        </p>
    </div>
);

const Select = ({
    value,
    onChange,
    options,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder: string;
}) => (
    <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        required
    >
        <option value="">{placeholder}</option>
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
            title: 'Binaan',
            href: teacherStudents.index().url,
        },
        {
            title: 'Daftarkan Binaan',
            href: teacherStudents.create().url,
        },
    ],
};
