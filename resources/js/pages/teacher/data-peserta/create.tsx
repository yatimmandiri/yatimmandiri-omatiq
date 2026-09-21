import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select as UiSelect,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes/teacher';
import binaan from '@/routes/teacher/data-binaan';
import dataPeserta from '@/routes/teacher/data-peserta';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    GraduationCap,
    IdCard,
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
    student_id?: number | string;
    nik: string;
    full_name?: string;
    name?: string;
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
        student = null,
        sanggars = [],
        preselected_student_id = null,
        selected_sanggar_id = null,
    } = usePage<{
        olimpiades?: Option[];
        students?: RosterStudent[];
        student?: RosterStudent | null;
        sanggars?: Array<{ id: number | string; name: string; type?: string }>;
        preselected_student_id?: number | string | null;
        selected_sanggar_id?: number | string | null;
    }>().props;

    const activeStudent =
        student ??
        students.find(
            (item) => String(item.id ?? item.student_id) === String(preselected_student_id),
        ) ??
        students[0] ??
        null;

    const studentName =
        activeStudent?.full_name || activeStudent?.name || '-';
    const studentId =
        activeStudent?.id ?? activeStudent?.student_id ?? '';

    const selectedSanggarId =
        selected_sanggar_id ?? activeStudent?.sanggar_id ?? '';

    const form = useForm({
        penyaluran_student_id: activeStudent ? String(studentId) : '',
        penyaluran_sanggar_id: selectedSanggarId ? String(selectedSanggarId) : '',
        olimpiade_id: '',
        achievements: '',
        notes: '',
    });

    const hasValidNik = Boolean(
        activeStudent?.nik &&
        activeStudent.nik.trim() !== '' &&
        activeStudent.nik.trim() !== '-' &&
        activeStudent.nik.trim() !== '0' &&
        activeStudent.nik.trim().toLowerCase() !== 'null' &&
        activeStudent.nik.trim().length >= 10,
    );

    const activeSanggar =
        sanggars.find(
            (item) => String(item.id) === form.data.penyaluran_sanggar_id,
        ) ?? null;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!hasValidNik) {
            return;
        }

        form.post(dataPeserta.store().url, {
            preserveScroll: true,
        });
    };

    const error = (name: string) => {
        const err = (form.errors as Record<string, string | undefined>)[name];

        return err ? (
            <p className="text-sm font-medium text-destructive">{err}</p>
        ) : null;
    };

    return (
        <form
            onSubmit={submit}
            className="mx-auto w-full max-w-5xl space-y-6 p-4 lg:p-6"
        >
            <div className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-[#17524A]/10 via-background to-emerald-50/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:p-7">
                <div className="max-w-2xl">
                    <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#17524A]/10 px-3 py-1 text-xs font-semibold text-[#17524A]">
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
                        onClick={() => router.visit(binaan.index().url)}
                    >
                        <ArrowLeft />
                        Kembali
                    </Button>
                    <Button
                        type="submit"
                        disabled={
                            form.processing ||
                            !activeStudent ||
                            !form.data.penyaluran_student_id ||
                            !hasValidNik
                        }
                    >
                        <Save />
                        {form.processing ? 'Menyimpan...' : 'Daftarkan'}
                    </Button>
                </div>
            </div>

            {activeStudent && !hasValidNik && (
                <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div>
                            <p className="text-sm font-semibold">
                                NIK Santri Belum Lengkap di Penyaluran
                            </p>
                            <p className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-300/90">
                                Santri{' '}
                                <strong>{studentName}</strong> belum
                                memiliki NIK yang valid di data Penyaluran. Silakan hubungi <strong>Admin</strong> untuk melengkapi atau memperbarui data NIK santri terlebih dahulu agar dapat didaftarkan ke OMATIQ.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!activeStudent && (
                <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
                    Santri binaan belum dipilih. Silakan kembali ke halaman Data Binaan untuk memilih santri yang ingin didaftarkan.
                </div>
            )}

            {activeStudent && (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card className="space-y-5 rounded-2xl p-5 shadow-sm lg:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#17524A]/10 text-[#17524A] dark:bg-[#17524A]/20 dark:text-emerald-300">
                                    <UserRound className="size-6" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-bold">
                                            {studentName}
                                        </h2>
                                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                                            Santri Terpilih
                                        </Badge>
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        ID Penyaluran:{' '}
                                        <span className="font-semibold text-foreground">
                                            {studentId || '-'}
                                        </span>{' '}
                                        • Data profil santri dari Penyaluran
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(binaan.index().url)}
                                className="shrink-0 text-xs"
                            >
                                <ArrowLeft className="mr-1 size-3.5" />
                                Ganti Santri
                            </Button>
                        </div>

                        {error('penyaluran_student_id')}

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
                                    Pilih sanggar tempat binaan belajar.
                                </p>
                            </Field>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            <InfoCard
                                icon={<IdCard className="size-5" />}
                                label="NIK"
                                value={
                                    hasValidNik ? (
                                        activeStudent?.nik
                                    ) : (
                                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                                            Belum terisi di Penyaluran
                                        </span>
                                    )
                                }
                            />
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
                                label="Kantor Cabang"
                                value={activeStudent?.kantor_name}
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

                    <Card className="space-y-5 rounded-2xl p-5 shadow-sm lg:p-6">
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
                                className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition outline-none focus:border-[#17524A]/30 focus:ring-2 focus:ring-[#17524A]/10"
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
                                className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition outline-none focus:border-[#17524A]/30 focus:ring-2 focus:ring-[#17524A]/10"
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
    value?: ReactNode;
    className?: string;
}) => (
    <div className={`rounded-2xl border bg-muted/30 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {icon}
            {label}
        </div>
        <div className="mt-2 text-sm font-semibold text-foreground">
            {value || 'Belum tersedia dari Penyaluran'}
        </div>
    </div>
);

const Select = ({
    value,
    onChange,
    options,
    placeholder,
}: {
    value?: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder: string;
}) => (
    <UiSelect
        value={value ? String(value) : undefined}
        onValueChange={onChange}
    >
        <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                    {option.label}
                </SelectItem>
            ))}
        </SelectContent>
    </UiSelect>
);

CreatePage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Data Peserta',
            href: dataPeserta.index().url,
        },
        {
            title: 'Daftarkan Binaan',
            href: dataPeserta.create().url,
        },
    ],
};
