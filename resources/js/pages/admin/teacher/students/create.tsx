import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import teacherStudents from '@/routes/admin/teacher/students';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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
    school_name: string;
    grade: string;
};

export default function CreatePage() {
    const {
        olimpiades = [],
        students = [],
        preselected_student_id = null,
    } = usePage<{
        olimpiades?: Option[];
        students?: RosterStudent[];
        preselected_student_id?: number | string | null;
    }>().props;

    const form = useForm<any>({
        student_id: preselected_student_id
            ? String(preselected_student_id)
            : '',
        olimpiade_id: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(teacherStudents.store().url, {
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
                    <h1 className="text-2xl font-bold">Daftarkan Binaan</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Daftarkan binaan Anda ke OMATIQ
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
                        disabled={form.processing || students.length === 0}
                    >
                        <Save />
                        {form.processing ? 'Menyimpan...' : 'Daftarkan'}
                    </Button>
                </div>
            </div>

            {students.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Belum ada binaan yang dapat didaftarkan. Silakan minta admin
                    untuk menambahkan atau mengimport data binaan terlebih
                    dahulu.
                </div>
            )}

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-bold">Data Pendaftaran</h2>
                <Field label="Binaan" error={error('student_id')}>
                    <Select
                        value={form.data.student_id}
                        onChange={(value) => form.setData('student_id', value)}
                        placeholder="Pilih binaan"
                        options={students.map((item) => ({
                            value: String(item.id),
                            label: `${item.full_name} - ${item.nik}`,
                        }))}
                    />
                    {students.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {form.data.student_id
                                ? students.find(
                                      (item) =>
                                          String(item.id) ===
                                          form.data.student_id,
                                  )?.school_name
                                : 'Hanya menampilkan binaan yang belum memiliki pendaftaran aktif.'}
                        </p>
                    )}
                </Field>
                <Field label="Kategori Lomba" error={error('olimpiade_id')}>
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
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
