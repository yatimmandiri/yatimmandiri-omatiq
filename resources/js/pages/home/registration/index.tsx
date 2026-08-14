import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpenCheck,
    Check,
    CheckCircle2,
    ClipboardCheck,
    FileUp,
    HeartHandshake,
    Save,
    Sparkles,
    Trophy,
    UserRound,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

type Option = {
    id: number | string;
    name: string;
    category?: string;
    slug?: string;
};
type Regency = {
    id: number | string;
    province_id: number | string;
    name: string;
};
type RegistrationErrors = Record<string, string | undefined>;

type RegistrationProps = {
    olimpiades?: Option[];
    provinces?: Option[];
    regencies?: Regency[];
    registration_closed?: boolean;
};

const referralOptions = [
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Facebook', label: 'Facebook' },
    { value: 'TikTok', label: 'TikTok' },
    { value: 'YouTube', label: 'YouTube' },
    { value: 'Teman/Keluarga', label: 'Teman/Keluarga' },
    { value: 'Guru/Sekolah', label: 'Guru/Sekolah' },
    { value: 'Poster/Banner', label: 'Poster/Banner' },
    { value: 'Website', label: 'Website' },
    { value: 'Lainnya', label: 'Lainnya' },
];

const steps = [
    {
        title: 'Data Peserta',
        description:
            'Identitas peserta, sekolah, alamat, dan informasi pendukung.',
        icon: UserRound,
        fields: [
            'nik',
            'full_name',
            'gender',
            'birth_place',
            'birth_date',
            'age',
            'school_name',
            'grade',
            'address',
            'province_id',
            'regency_id',
            'parent_phone',
            'mentor_name',
            'mentor_phone',
            'referral_source',
        ],
    },
    {
        title: 'Kategori Lomba',
        description: 'Pilih cabang olimpiade yang akan diikuti.',
        icon: Trophy,
        fields: ['olimpiade_id'],
    },
    {
        title: 'Dokumen',
        description: 'Upload pas foto, kartu pelajar, dan kartu keluarga.',
        icon: FileUp,
        fields: ['photo', 'identity_card', 'family_card'],
    },
    {
        title: 'Persetujuan',
        description:
            'Buat akun, konfirmasi data, dan persetujuan peserta serta wali.',
        icon: HeartHandshake,
        fields: [
            'email',
            'password',
            'password_confirmation',
            'participant_signature_name',
            'guardian_signature_name',
            'data_truth_consent',
            'documentation_consent',
            'rules_consent',
        ],
    },
];

export default function RegistrationPage() {
    const {
        olimpiades = [],
        provinces = [],
        regencies = [],
        registration_closed,
    } = usePage<RegistrationProps>().props;

    const [currentStep, setCurrentStep] = useState(0);
    const [localErrors, setLocalErrors] = useState<RegistrationErrors>({});

    const form = useForm<any>({
        nik: '',
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
        referral_source: '',
        referral_source_other: '',
        olimpiade_id: '',
        photo: null,
        identity_card: null,
        family_card: null,
        data_truth_consent: false,
        documentation_consent: false,
        rules_consent: false,
        participant_signature_name: '',
        guardian_signature_name: '',
        email: '',
        password: '',
        password_confirmation: '',
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

    const mergedErrors = {
        ...localErrors,
        ...(form.errors as RegistrationErrors),
    };
    const isLastStep = currentStep === steps.length - 1;

    const scrollToForm = () => {
        window.requestAnimationFrame(() => {
            document
                .getElementById('registration-form')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const errorsKey = Object.keys(form.errors).join(',');
    const [prevErrorsKey, setPrevErrorsKey] = useState('');

    if (errorsKey && errorsKey !== prevErrorsKey) {
        setPrevErrorsKey(errorsKey);

        const targetStep = steps.findIndex((step) =>
            step.fields.some((field) => form.errors[field]),
        );

        if (targetStep >= 0) {
            setCurrentStep(targetStep);
            scrollToForm();
        }
    }

    const setFile = (name: string, file?: File | null) => {
        form.setData(name, file ?? null);
        setLocalErrors((errors) => ({ ...errors, [name]: undefined }));
    };

    const setData = (name: string, value: any) => {
        form.setData(name, value);
        setLocalErrors((errors) => ({ ...errors, [name]: undefined }));
    };

    const validateStep = (step: number) => {
        const errors: RegistrationErrors = {};
        const required = (field: string, message: string) => {
            const value = form.data[field];

            if (value === null || value === undefined || value === '') {
                errors[field] = message;
            }
        };

        if (step === 0) {
            required('nik', 'NIK (16 digit) wajib diisi.');

            if (form.data.nik && form.data.nik.length !== 16) {
                errors.nik = 'NIK harus 16 digit.';
            }

            required('full_name', 'Nama lengkap wajib diisi.');
            required('gender', 'Jenis kelamin wajib dipilih.');
            required('birth_place', 'Tempat lahir wajib diisi.');
            required('birth_date', 'Tanggal lahir wajib diisi.');
            required('age', 'Usia wajib diisi.');
            required('school_name', 'Nama sekolah wajib diisi.');
            required('grade', 'Kelas wajib diisi.');
            required('address', 'Alamat lengkap wajib diisi.');
            required('province_id', 'Provinsi wajib dipilih.');
            required('regency_id', 'Kota/kabupaten wajib dipilih.');
            required('parent_phone', 'Nomor HP orang tua/wali wajib diisi.');
            required('referral_source', 'Sumber informasi wajib dipilih.');

            if (form.data.referral_source === 'Lainnya') {
                required(
                    'referral_source_other',
                    'Sumber informasi lainnya wajib diisi.',
                );
            }
        }

        if (step === 1) {
            required('olimpiade_id', 'Kategori olimpiade wajib dipilih.');
        }

        if (step === 2) {
            required('photo', 'Pas foto wajib diupload.');
            required(
                'identity_card',
                'Kartu pelajar/identitas wajib diupload.',
            );
            required('family_card', 'Kartu keluarga (KK) wajib diupload.');
        }

        if (step === 3) {
            required('email', 'Email wajib diisi.');
            required('password', 'Password wajib diisi.');
            required(
                'password_confirmation',
                'Konfirmasi password wajib diisi.',
            );

            if (
                form.data.password &&
                form.data.password_confirmation &&
                form.data.password !== form.data.password_confirmation
            ) {
                errors.password_confirmation =
                    'Konfirmasi password tidak cocok.';
            }

            if (form.data.password && form.data.password.length < 8) {
                errors.password = 'Password minimal 8 karakter.';
            }

            required(
                'participant_signature_name',
                'Nama tanda tangan peserta wajib diisi.',
            );
            required(
                'guardian_signature_name',
                'Nama tanda tangan wali wajib diisi.',
            );

            if (!form.data.data_truth_consent) {
                errors.data_truth_consent =
                    'Persetujuan kebenaran data wajib dicentang.';
            }

            if (!form.data.documentation_consent) {
                errors.documentation_consent =
                    'Persetujuan dokumentasi wajib dicentang.';
            }

            if (!form.data.rules_consent) {
                errors.rules_consent = 'Persetujuan ketentuan wajib dicentang.';
            }
        }

        setLocalErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const goToStep = (targetStep: number) => {
        if (targetStep <= currentStep) {
            setCurrentStep(targetStep);
            setLocalErrors({});
            scrollToForm();

            return;
        }

        for (let step = currentStep; step < targetStep; step += 1) {
            if (!validateStep(step)) {
                return;
            }
        }

        setCurrentStep(targetStep);
        scrollToForm();
    };

    const nextStep = () => {
        if (!validateStep(currentStep)) {
            return;
        }

        setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
        setLocalErrors({});
        scrollToForm();
    };

    const previousStep = () => {
        setCurrentStep((step) => Math.max(step - 1, 0));
        setLocalErrors({});
        scrollToForm();
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateStep(currentStep)) {
            return;
        }

        if (!isLastStep) {
            nextStep();

            return;
        }

        form.post('/pendaftaran', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const currentStepData = steps[currentStep];
    const StepIcon = currentStepData.icon;

    if (registration_closed) {
        return (
            <section className="relative overflow-hidden px-5 pt-32 pb-20 lg:px-8">
                <div className="absolute top-20 left-0 h-56 w-56 rounded-[56px] bg-[#5DD39E]/20 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-64 w-64 rounded-[64px] bg-[#17524A]/15 blur-3xl" />
                <div className="relative mx-auto max-w-2xl rounded-[32px] bg-white p-8 text-center shadow-2xl ring-1 shadow-[#17524A]/10 ring-slate-100">
                    <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#17524A]/10 text-[#17524A]">
                        <BookOpenCheck className="h-10 w-10" />
                    </span>
                    <h1 className="mt-6 text-3xl font-black text-[#1E293B] sm:text-4xl">
                        Pendaftaran Sedang Ditutup
                    </h1>
                    <p className="mx-auto mt-4 max-w-lg text-base leading-8 text-[#64748B]">
                        Saat ini belum ada sesi pendaftaran yang dibuka. Pantau
                        terus website dan media sosial OMATIQ untuk informasi
                        pendaftaran berikutnya.
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#17524A] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#17524A]/25 transition hover:-translate-y-1"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="relative overflow-hidden px-5 pt-28 pb-10 sm:pt-32 lg:px-8">
                <div className="absolute top-20 left-0 h-52 w-52 rounded-[56px] bg-[#17524A]/15 blur-3xl dark:bg-[#17524A]/10" />
                <div className="absolute right-0 bottom-0 h-64 w-64 rounded-[64px] bg-[#56CCF2]/20 blur-3xl dark:bg-[#56CCF2]/10" />
                <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <Link
                            href="/olimpiade"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#17524A] shadow-sm ring-1 ring-slate-100 dark:bg-[#1E293B] dark:text-[#56CCF2] dark:ring-slate-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Olimpiade
                        </Link>
                        <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#17524A]/10 px-4 py-2 text-sm font-black text-[#17524A]">
                            <Sparkles className="h-4 w-4" />
                            Form Pendaftaran OMATIQ 2026
                        </span>
                        <h1 className="mt-6 text-3xl leading-tight font-black text-[#1E293B] sm:text-5xl lg:text-6xl dark:text-white">
                            Saatnya tunjukkan potensi terbaikmu!
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-[#64748B] sm:text-lg dark:text-slate-400">
                            Daftarkan dirimu menjadi bagian dari OMATIQ 2026.
                            Isi formulir bertahap agar proses pendaftaran lebih
                            ringan, rapi, dan mudah diperiksa.
                        </p>
                    </div>
                    <div className="rounded-[32px] bg-white p-5 shadow-2xl ring-1 shadow-[#17524A]/10 ring-slate-100 sm:p-7 dark:bg-[#1E293B] dark:shadow-slate-900/50 dark:ring-slate-700">
                        <div className="mb-5 flex items-center gap-4">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17524A]/10 text-[#17524A] dark:bg-[#17524A]/20">
                                <StepIcon className="h-7 w-7" />
                            </span>
                            <div>
                                <p className="text-sm font-black text-[#17524A]">
                                    Step {currentStep + 1} dari {steps.length}
                                </p>
                                <p className="text-xl font-black text-[#1E293B] dark:text-white">
                                    {currentStepData.title}
                                </p>
                            </div>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                            <div
                                className="h-full rounded-full bg-[#17524A] transition-all duration-500"
                                style={{
                                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                                }}
                            />
                        </div>
                        <p className="mt-5 text-sm leading-7 font-semibold text-[#64748B] dark:text-slate-400">
                            {currentStepData.description}
                        </p>
                    </div>
                </div>
            </section>

            <section id="registration-form" className="px-5 py-10 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[320px_1fr]">
                    <aside className="lg:sticky lg:top-28 lg:self-start">
                        <div className="rounded-[32px] bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-[#1E293B] dark:ring-slate-700">
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = index === currentStep;
                                    const isDone = index < currentStep;

                                    return (
                                        <button
                                            key={step.title}
                                            type="button"
                                            onClick={() => goToStep(index)}
                                            className={`flex items-center gap-3 rounded-2xl p-3 text-left transition ${
                                                isActive
                                                    ? 'bg-[#E7F0ED] text-[#17524A] dark:bg-[#17524A]/20 dark:text-[#17524A]'
                                                    : 'text-[#64748B] hover:bg-[#F8FAFC] dark:text-slate-400 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <span
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                    isDone
                                                        ? 'bg-[#22C55E] text-white'
                                                        : isActive
                                                          ? 'bg-[#17524A] text-white'
                                                          : 'bg-[#F8FAFC] text-[#17524A] dark:bg-slate-800 dark:text-[#56CCF2]'
                                                }`}
                                            >
                                                {isDone ? (
                                                    <Check className="h-5 w-5" />
                                                ) : (
                                                    <Icon className="h-5 w-5" />
                                                )}
                                            </span>
                                            <span>
                                                <span className="block text-sm font-black">
                                                    {step.title}
                                                </span>
                                                <span className="mt-0.5 block text-xs font-semibold opacity-80">
                                                    Step {index + 1}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <form onSubmit={submit} className="space-y-6">
                        {currentStep === 0 && (
                            <FormSection
                                icon={UserRound}
                                title="A. Data Peserta"
                                description="Isi identitas peserta dan informasi pendukung pendaftaran."
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field
                                        label="NIK (16 digit)"
                                        error={mergedErrors.nik}
                                    >
                                        <Input
                                            value={form.data.nik}
                                            onChange={(event) =>
                                                setData(
                                                    'nik',
                                                    event.target.value
                                                        .replace(/\D/g, '')
                                                        .slice(0, 16),
                                                )
                                            }
                                            maxLength={16}
                                            placeholder="16 digit NIK"
                                        />
                                    </Field>
                                    <Field
                                        label="Nama Lengkap Peserta"
                                        error={mergedErrors.full_name}
                                    >
                                        <Input
                                            value={form.data.full_name}
                                            onChange={(event) =>
                                                setData(
                                                    'full_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Nama Panggilan"
                                        error={mergedErrors.nickname}
                                    >
                                        <Input
                                            value={form.data.nickname}
                                            onChange={(event) =>
                                                setData(
                                                    'nickname',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Jenis Kelamin"
                                        error={mergedErrors.gender}
                                    >
                                        <Select
                                            value={form.data.gender}
                                            onChange={(value) =>
                                                setData('gender', value)
                                            }
                                            placeholder="Pilih jenis kelamin"
                                            options={[
                                                {
                                                    value: 'male',
                                                    label: 'Laki-laki',
                                                },
                                                {
                                                    value: 'female',
                                                    label: 'Perempuan',
                                                },
                                            ]}
                                        />
                                    </Field>
                                    <Field
                                        label="Tempat Lahir"
                                        error={mergedErrors.birth_place}
                                    >
                                        <Input
                                            value={form.data.birth_place}
                                            onChange={(event) =>
                                                setData(
                                                    'birth_place',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Tanggal Lahir"
                                        error={mergedErrors.birth_date}
                                    >
                                        <Input
                                            type="date"
                                            value={form.data.birth_date}
                                            onChange={(event) =>
                                                setData(
                                                    'birth_date',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Usia"
                                        error={mergedErrors.age}
                                    >
                                        <Input
                                            type="number"
                                            min={5}
                                            max={20}
                                            value={form.data.age}
                                            onChange={(event) =>
                                                setData(
                                                    'age',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Kelas"
                                        error={mergedErrors.grade}
                                    >
                                        <Input
                                            value={form.data.grade}
                                            onChange={(event) =>
                                                setData(
                                                    'grade',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Contoh: 1 / 2 / 3 / 4 / 5 / 6"
                                        />
                                    </Field>
                                    <Field
                                        label="Nama Sekolah"
                                        error={mergedErrors.school_name}
                                    >
                                        <Input
                                            value={form.data.school_name}
                                            onChange={(event) =>
                                                setData(
                                                    'school_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Nomor HP Orang Tua/Wali"
                                        error={mergedErrors.parent_phone}
                                    >
                                        <Input
                                            value={form.data.parent_phone}
                                            onChange={(event) =>
                                                setData(
                                                    'parent_phone',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                                <Field
                                    label="Alamat Lengkap"
                                    error={mergedErrors.address}
                                >
                                    <Textarea
                                        rows={4}
                                        value={form.data.address}
                                        onChange={(event) =>
                                            setData(
                                                'address',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field
                                        label="Provinsi"
                                        error={mergedErrors.province_id}
                                    >
                                        <Select
                                            value={String(
                                                form.data.province_id,
                                            )}
                                            onChange={(value) => {
                                                form.setData((data: any) => ({
                                                    ...data,
                                                    province_id: value,
                                                    regency_id: '',
                                                }));
                                                setLocalErrors((errors) => ({
                                                    ...errors,
                                                    province_id: undefined,
                                                    regency_id: undefined,
                                                }));
                                            }}
                                            placeholder="Pilih provinsi"
                                            options={provinces.map((item) => ({
                                                value: String(item.id),
                                                label: item.name,
                                            }))}
                                        />
                                    </Field>
                                    <Field
                                        label="Kota/Kabupaten"
                                        error={mergedErrors.regency_id}
                                    >
                                        <Select
                                            value={String(form.data.regency_id)}
                                            onChange={(value) =>
                                                setData('regency_id', value)
                                            }
                                            placeholder={
                                                form.data.province_id
                                                    ? 'Pilih kota/kabupaten'
                                                    : 'Pilih provinsi dulu'
                                            }
                                            disabled={!form.data.province_id}
                                            options={filteredRegencies.map(
                                                (item) => ({
                                                    value: String(item.id),
                                                    label: item.name,
                                                }),
                                            )}
                                        />
                                    </Field>
                                </div>
                                <div className="border-t border-slate-100 pt-5 dark:border-slate-700">
                                    <p className="mb-4 text-sm font-black text-[#64748B] dark:text-slate-400">
                                        Informasi Pendukung
                                    </p>
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <Field
                                            label="Nama Orang Tua / Wali / Pendamping"
                                            error={mergedErrors.mentor_name}
                                        >
                                            <Input
                                                value={form.data.mentor_name}
                                                onChange={(event) =>
                                                    setData(
                                                        'mentor_name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Nomor HP Orang Tua / Wali / Pendamping"
                                            error={mergedErrors.mentor_phone}
                                        >
                                            <Input
                                                value={form.data.mentor_phone}
                                                onChange={(event) =>
                                                    setData(
                                                        'mentor_phone',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                                        <Field
                                            label="Dapat Info OMATIQ dari?"
                                            error={mergedErrors.referral_source}
                                        >
                                            <Select
                                                value={
                                                    form.data.referral_source
                                                }
                                                onChange={(value) =>
                                                    setData(
                                                        'referral_source',
                                                        value,
                                                    )
                                                }
                                                placeholder="Pilih sumber informasi"
                                                options={referralOptions}
                                            />
                                        </Field>
                                        {form.data.referral_source ===
                                            'Lainnya' && (
                                            <Field
                                                label="Sumber Lainnya"
                                                error={
                                                    mergedErrors.referral_source_other
                                                }
                                            >
                                                <Input
                                                    value={
                                                        form.data
                                                            .referral_source_other
                                                    }
                                                    onChange={(event) =>
                                                        setData(
                                                            'referral_source_other',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>
                                        )}
                                    </div>
                                </div>
                            </FormSection>
                        )}

                        {currentStep === 1 && (
                            <FormSection
                                icon={Trophy}
                                title="B. Kategori Lomba"
                                description="Pilih cabang olimpiade yang akan diikuti peserta."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    {olimpiades.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() =>
                                                setData(
                                                    'olimpiade_id',
                                                    String(item.id),
                                                )
                                            }
                                            className={`rounded-3xl border p-5 text-left transition hover:-translate-y-1 ${
                                                form.data.olimpiade_id ===
                                                String(item.id)
                                                    ? 'border-[#17524A] bg-[#E7F0ED] shadow-lg shadow-[#17524A]/10 dark:border-[#17524A] dark:bg-[#17524A]/20'
                                                    : 'border-slate-100 bg-[#F8FAFC] dark:border-slate-700 dark:bg-slate-800'
                                            }`}
                                        >
                                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-700">
                                                {`${item.name} ${item.category}`
                                                    .toLowerCase()
                                                    .includes('qur') ? (
                                                    <BookOpenCheck className="h-6 w-6 text-[#17524A]" />
                                                ) : (
                                                    <Trophy className="h-6 w-6 text-[#17524A]" />
                                                )}
                                            </span>
                                            <p className="mt-4 text-lg font-black text-[#1E293B] dark:text-white">
                                                {item.name}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[#64748B] dark:text-slate-400">
                                                {item.category}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                {mergedErrors.olimpiade_id && (
                                    <p className="mt-3 text-sm font-medium text-destructive">
                                        {mergedErrors.olimpiade_id}
                                    </p>
                                )}
                            </FormSection>
                        )}

                        {currentStep === 2 && (
                            <FormSection
                                icon={FileUp}
                                title="C. Dokumen Pendukung"
                                description="Lampirkan pas foto, kartu pelajar/identitas, dan kartu keluarga (KK)."
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FileField
                                        label="Upload Pas Foto"
                                        file={form.data.photo}
                                        error={mergedErrors.photo}
                                        onChange={(file) =>
                                            setFile('photo', file)
                                        }
                                        accept="image/*"
                                    />
                                    <FileField
                                        label="Upload Kartu Pelajar / Identitas"
                                        file={form.data.identity_card}
                                        error={mergedErrors.identity_card}
                                        onChange={(file) =>
                                            setFile('identity_card', file)
                                        }
                                        accept="image/*,.pdf"
                                    />
                                    <FileField
                                        label="Upload Kartu Keluarga (KK)"
                                        file={form.data.family_card}
                                        error={mergedErrors.family_card}
                                        onChange={(file) =>
                                            setFile('family_card', file)
                                        }
                                        accept="image/*,.pdf"
                                    />
                                </div>
                            </FormSection>
                        )}

                        {currentStep === 3 && (
                            <FormSection
                                icon={HeartHandshake}
                                title="D. Akun & Persetujuan"
                                description="Buat akun untuk pantau pendaftaran, lalu konfirmasi data peserta dan wali."
                            >
                                <div className="mb-6 rounded-3xl bg-[#E7F0ED] p-5 dark:bg-[#17524A]/10">
                                    <div className="mb-4 flex items-center gap-3">
                                        <ClipboardCheck className="h-6 w-6 text-[#17524A]" />
                                        <p className="font-black text-[#1E293B] dark:text-white">
                                            Buat Akun untuk Pantau Pendaftaran
                                        </p>
                                    </div>
                                    <p className="text-sm leading-7 text-[#64748B] dark:text-slate-400">
                                        Akun ini akan digunakan untuk login ke
                                        dashboard dan upload bukti pembayaran
                                        nantinya.
                                    </p>
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field
                                        label="Email"
                                        error={mergedErrors.email}
                                    >
                                        <Input
                                            type="email"
                                            value={form.data.email}
                                            onChange={(event) =>
                                                setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="contoh@email.com"
                                        />
                                    </Field>
                                    <Field
                                        label="Password"
                                        error={mergedErrors.password}
                                    >
                                        <Input
                                            type="password"
                                            value={form.data.password}
                                            onChange={(event) =>
                                                setData(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Minimal 8 karakter"
                                        />
                                    </Field>
                                    <Field
                                        label="Konfirmasi Password"
                                        error={
                                            mergedErrors.password_confirmation
                                        }
                                    >
                                        <Input
                                            type="password"
                                            value={
                                                form.data.password_confirmation
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    'password_confirmation',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Ulangi password"
                                        />
                                    </Field>
                                </div>
                                <div className="mt-6 rounded-3xl bg-[#F8FAFC] p-5 dark:bg-slate-800">
                                    <div className="mb-4 flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-[#22C55E]" />
                                        <p className="font-black text-[#1E293B] dark:text-white">
                                            Pemeriksaan terakhir sebelum dikirim
                                        </p>
                                    </div>
                                    <div className="grid gap-3 text-sm font-bold text-[#64748B] sm:grid-cols-2 dark:text-slate-400">
                                        <p>
                                            Peserta:{' '}
                                            {form.data.full_name || '-'}
                                        </p>
                                        <p>
                                            Sekolah:{' '}
                                            {form.data.school_name || '-'}
                                        </p>
                                        <p>
                                            HP Wali:{' '}
                                            {form.data.parent_phone || '-'}
                                        </p>
                                        <p>Email: {form.data.email || '-'}</p>
                                    </div>
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field
                                        label="Tanda Tangan Peserta (Nama Lengkap)"
                                        error={
                                            mergedErrors.participant_signature_name
                                        }
                                    >
                                        <Input
                                            value={
                                                form.data
                                                    .participant_signature_name
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    'participant_signature_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Tanda Tangan Orang Tua/Wali/Pendamping"
                                        error={
                                            mergedErrors.guardian_signature_name
                                        }
                                    >
                                        <Input
                                            value={
                                                form.data
                                                    .guardian_signature_name
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    'guardian_signature_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                                <div className="space-y-3">
                                    <Consent
                                        checked={form.data.data_truth_consent}
                                        onChange={(checked) =>
                                            setData(
                                                'data_truth_consent',
                                                checked,
                                            )
                                        }
                                        text="Saya menyatakan bahwa seluruh data yang diberikan adalah benar dan dapat dipertanggungjawabkan."
                                        error={mergedErrors.data_truth_consent}
                                    />
                                    <Consent
                                        checked={
                                            form.data.documentation_consent
                                        }
                                        onChange={(checked) =>
                                            setData(
                                                'documentation_consent',
                                                checked,
                                            )
                                        }
                                        text="Saya menyetujui penggunaan dokumentasi selama kegiatan OMATIQ berlangsung."
                                        error={
                                            mergedErrors.documentation_consent
                                        }
                                    />
                                    <Consent
                                        checked={form.data.rules_consent}
                                        onChange={(checked) =>
                                            setData('rules_consent', checked)
                                        }
                                        text="Saya bersedia mengikuti seluruh ketentuan dan jadwal kegiatan OMATIQ."
                                        error={mergedErrors.rules_consent}
                                    />
                                </div>
                            </FormSection>
                        )}

                        <div className="sticky bottom-4 z-20 rounded-3xl bg-white/90 p-4 shadow-2xl ring-1 ring-slate-100 backdrop-blur dark:bg-[#1E293B]/90 dark:ring-slate-700">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={previousStep}
                                    disabled={
                                        currentStep === 0 || form.processing
                                    }
                                    className="rounded-xl px-5 py-6 text-sm font-black"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Sebelumnya
                                </Button>
                                <p className="text-center text-sm leading-7 font-bold text-[#64748B] dark:text-slate-400">
                                    Step {currentStep + 1} dari {steps.length}
                                </p>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-[#17524A] px-6 py-6 text-sm font-black text-white hover:bg-[#0F4038]"
                                >
                                    {form.processing ? (
                                        <>
                                            <Sparkles className="h-4 w-4 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : isLastStep ? (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Kirim Pendaftaran
                                        </>
                                    ) : (
                                        <>
                                            Lanjut
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}

const FormSection = ({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    children: ReactNode;
}) => (
    <section className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7 dark:bg-[#1E293B] dark:ring-slate-700">
        <div className="mb-6 flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#17524A]/10 text-[#17524A] dark:bg-[#17524A]/20">
                <Icon className="h-6 w-6" />
            </span>
            <div>
                <h2 className="text-2xl font-black text-[#1E293B] dark:text-white">
                    {title}
                </h2>
                <p className="mt-1 text-sm leading-7 text-[#64748B] dark:text-slate-400">
                    {description}
                </p>
            </div>
        </div>
        <div className="space-y-5">{children}</div>
    </section>
);

const Field = ({
    label,
    children,
    error,
}: {
    label: string;
    children: ReactNode;
    error?: string;
}) => (
    <div className="space-y-2">
        <Label className="font-black text-[#1E293B] dark:text-white">
            {label}
        </Label>
        {children}
        {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
        )}
    </div>
);

const Select = ({
    value,
    onChange,
    placeholder,
    options,
    disabled = false,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
}) => (
    <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#1E293B] transition outline-none focus:border-[#17524A] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
    >
        <option value="">{placeholder}</option>
        {options.map((item) => (
            <option key={item.value} value={item.value}>
                {item.label}
            </option>
        ))}
    </select>
);

const FileField = ({
    label,
    error,
    accept,
    file,
    onChange,
}: {
    label: string;
    error?: string;
    accept: string;
    file?: File | null;
    onChange: (file?: File | null) => void;
}) => (
    <div className="space-y-2">
        <Label className="font-black text-[#1E293B] dark:text-white">
            {label}
        </Label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-[#F8FAFC] px-5 py-8 text-center transition hover:border-[#17524A] hover:bg-[#E7F0ED] dark:border-slate-600 dark:bg-slate-800 dark:hover:border-[#17524A] dark:hover:bg-[#17524A]/10">
            <FileUp className="h-7 w-7 text-[#17524A]" />
            <span className="mt-3 text-sm font-black text-[#1E293B] dark:text-white">
                {file?.name ?? 'Pilih file'}
            </span>
            <span className="mt-1 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                JPG, PNG, atau PDF
            </span>
            <input
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(event) => onChange(event.target.files?.[0])}
            />
        </label>
        {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
        )}
    </div>
);

const Consent = ({
    checked,
    onChange,
    text,
    error,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    text: string;
    error?: string;
}) => (
    <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#F8FAFC] p-4 dark:bg-slate-800">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#17524A] dark:border-slate-600"
            />
            <span className="text-sm leading-7 font-bold text-[#1E293B] dark:text-white">
                {text}
            </span>
        </label>
        {error && (
            <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        )}
    </div>
);
