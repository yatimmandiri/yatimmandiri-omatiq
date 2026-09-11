import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select as UiSelect,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    RotateCcw,
    Save,
    Sparkles,
    Trophy,
    UserRound,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Option = {
    id: number | string;
    name: string;
    category?: string;
    slug?: string;
    province_id?: number | string;
    regency_id?: number | string;
    district_id?: number | string;
};
type Branch = {
    id: number | string;
    name: string;
};
type RegistrationErrors = Record<string, string | undefined>;

type RegistrationProps = {
    olimpiades?: Option[];
    provinces?: Option[];
    branches?: Branch[];
    registration_closed?: boolean;
};

const DRAFT_STORAGE_KEY = 'omatiq_registration_draft_v1';

function getStoredDraft(): {
    currentStep?: number;
    form?: Record<string, any>;
} | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);

        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setStoredDraft(data: {
    currentStep: number;
    form: Record<string, any>;
}): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch {
        // ignore quota error
    }
}

function removeStoredDraft(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
        // ignore
    }
}

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
            'school_name',
            'grade',
            'address',
            'province_id',
            'regency_id',
            'district_id',
            'village_id',
            'parent_phone',
            'referral_source',
            'branch',
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
        description: 'Upload bukti transfer pendaftaran dan kartu pelajar.',
        icon: FileUp,
        fields: ['payment_proof', 'student_card'],
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
        branches = [],
        registration_closed,
    } = usePage<RegistrationProps>().props;

    const initialDraft = useMemo(() => getStoredDraft(), []);

    const [currentStep, setCurrentStep] = useState<number>(() => {
        if (
            typeof initialDraft?.currentStep === 'number' &&
            initialDraft.currentStep >= 0 &&
            initialDraft.currentStep < steps.length
        ) {
            return initialDraft.currentStep;
        }

        return 0;
    });

    const [localErrors, setLocalErrors] = useState<RegistrationErrors>({});

    const [regencies, setRegencies] = useState<Option[]>([]);
    const [districts, setDistricts] = useState<Option[]>([]);
    const [villages, setVillages] = useState<Option[]>([]);

    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    const regionCache = useRef<{
        regencies: Record<string, Option[]>;
        districts: Record<string, Option[]>;
        villages: Record<string, Option[]>;
    }>({
        regencies: {},
        districts: {},
        villages: {},
    });

    const form = useForm<any>({
        nik: initialDraft?.form?.nik ?? '',
        full_name: initialDraft?.form?.full_name ?? '',
        nickname: initialDraft?.form?.nickname ?? '',
        gender: initialDraft?.form?.gender ?? '',
        birth_place: initialDraft?.form?.birth_place ?? '',
        birth_date: initialDraft?.form?.birth_date ?? '',
        school_name: initialDraft?.form?.school_name ?? '',
        grade: initialDraft?.form?.grade ?? '',
        address: initialDraft?.form?.address ?? '',
        province_id: initialDraft?.form?.province_id ?? '',
        regency_id: initialDraft?.form?.regency_id ?? '',
        district_id: initialDraft?.form?.district_id ?? '',
        village_id: initialDraft?.form?.village_id ?? '',
        parent_phone: initialDraft?.form?.parent_phone ?? '',
        referral_source: initialDraft?.form?.referral_source ?? '',
        branch: initialDraft?.form?.branch ?? '',
        olimpiade_id: initialDraft?.form?.olimpiade_id ?? '',
        payment_proof: null,
        student_card: null,
        data_truth_consent: initialDraft?.form?.data_truth_consent ?? false,
        documentation_consent:
            initialDraft?.form?.documentation_consent ?? false,
        rules_consent: initialDraft?.form?.rules_consent ?? false,
        participant_signature_name:
            initialDraft?.form?.participant_signature_name ?? '',
        guardian_signature_name:
            initialDraft?.form?.guardian_signature_name ?? '',
        email: initialDraft?.form?.email ?? '',
        password: '',
        password_confirmation: '',
    });

    // Simpan perubahan form ke sessionStorage secara otomatis
    useEffect(() => {
        const persistable = { ...form.data };

        delete persistable.payment_proof;
        delete persistable.student_card;
        delete persistable.password;
        delete persistable.password_confirmation;

        setStoredDraft({
            currentStep,
            form: persistable,
        });
    }, [form.data, currentStep]);

    // Fetch regencies saat province_id berubah
    useEffect(() => {
        const pid = form.data.province_id;

        if (!pid) {
            setRegencies([]);

            return;
        }

        if (regionCache.current.regencies[pid]) {
            setRegencies(regionCache.current.regencies[pid]);

            return;
        }

        const controller = new AbortController();
        setLoadingRegencies(true);

        fetch(`/regions/regencies?province_id=${encodeURIComponent(pid)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => {
                const data = p.data ?? [];
                regionCache.current.regencies[pid] = data;
                setRegencies(data);
            })
            .catch((e) => {
                if (e.name !== 'AbortError') {
                    setRegencies([]);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingRegencies(false);
                }
            });

        return () => controller.abort();
    }, [form.data.province_id]);

    // Fetch districts saat regency_id berubah
    useEffect(() => {
        const rid = form.data.regency_id;

        if (!rid) {
            setDistricts([]);

            return;
        }

        if (regionCache.current.districts[rid]) {
            setDistricts(regionCache.current.districts[rid]);

            return;
        }

        const controller = new AbortController();
        setLoadingDistricts(true);

        fetch(`/regions/districts?regency_id=${encodeURIComponent(rid)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => {
                const data = p.data ?? [];
                regionCache.current.districts[rid] = data;
                setDistricts(data);
            })
            .catch((e) => {
                if (e.name !== 'AbortError') {
                    setDistricts([]);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingDistricts(false);
                }
            });

        return () => controller.abort();
    }, [form.data.regency_id]);

    // Fetch villages saat district_id berubah
    useEffect(() => {
        const did = form.data.district_id;

        if (!did) {
            setVillages([]);

            return;
        }

        if (regionCache.current.villages[did]) {
            setVillages(regionCache.current.villages[did]);

            return;
        }

        const controller = new AbortController();
        setLoadingVillages(true);

        fetch(`/regions/villages?district_id=${encodeURIComponent(did)}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => {
                const data = p.data ?? [];
                regionCache.current.villages[did] = data;
                setVillages(data);
            })
            .catch((e) => {
                if (e.name !== 'AbortError') {
                    setVillages([]);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingVillages(false);
                }
            });

        return () => controller.abort();
    }, [form.data.district_id]);

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

    const setConsentAgreements = (checked: boolean) => {
        form.setData((data: any) => ({
            ...data,
            data_truth_consent: checked,
            documentation_consent: checked,
            rules_consent: checked,
        }));
        setLocalErrors((errors) => ({
            ...errors,
            data_truth_consent: undefined,
            documentation_consent: undefined,
            rules_consent: undefined,
        }));
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
            required('school_name', 'Nama sekolah wajib diisi.');
            required('grade', 'Kelas wajib diisi.');
            required('address', 'Alamat lengkap wajib diisi.');
            required('province_id', 'Provinsi wajib dipilih.');
            required('regency_id', 'Kota/kabupaten wajib dipilih.');
            required('district_id', 'Kecamatan wajib dipilih.');
            required('village_id', 'Desa/kelurahan wajib dipilih.');
            required('parent_phone', 'Nomor HP orang tua/wali wajib diisi.');
            required('referral_source', 'Rekomendasi wajib diisi.');
            required('branch', 'Cabang wajib diisi.');
        }

        if (step === 1) {
            required('olimpiade_id', 'Kategori olimpiade wajib dipilih.');
        }

        if (step === 2) {
            required(
                'payment_proof',
                'Bukti transfer pendaftaran wajib diupload.',
            );
            required('student_card', 'Kartu pelajar wajib diupload.');
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

            if (
                !form.data.data_truth_consent ||
                !form.data.documentation_consent ||
                !form.data.rules_consent
            ) {
                errors.data_truth_consent =
                    'Persetujuan peserta dan wali wajib dicentang.';
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

    const resetDraft = () => {
        if (
            window.confirm(
                'Apakah Anda yakin ingin mengosongkan formulir dan memulai dari awal?',
            )
        ) {
            removeStoredDraft();
            form.reset();
            setCurrentStep(0);
            setLocalErrors({});
            setRegencies([]);
            setDistricts([]);
            setVillages([]);
            scrollToForm();
        }
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
            onSuccess: () => {
                removeStoredDraft();
            },
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
                            <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={resetDraft}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-[#64748B] transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Mulai Ulang Formulir
                                </button>
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
                                        label="Kelas"
                                        error={mergedErrors.grade}
                                    >
                                        <Select
                                            value={String(form.data.grade)}
                                            onChange={(value) =>
                                                setData('grade', value)
                                            }
                                            placeholder="Pilih kelas"
                                            options={[
                                                {
                                                    value: 'I',
                                                    label: 'Kelas I',
                                                },
                                                {
                                                    value: 'II',
                                                    label: 'Kelas II',
                                                },
                                                {
                                                    value: 'III',
                                                    label: 'Kelas III',
                                                },
                                                {
                                                    value: 'IV',
                                                    label: 'Kelas IV',
                                                },
                                                {
                                                    value: 'V',
                                                    label: 'Kelas V',
                                                },
                                                {
                                                    value: 'VI',
                                                    label: 'Kelas VI',
                                                },
                                            ]}
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
                                </div>
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
                                                    district_id: '',
                                                    village_id: '',
                                                }));
                                                setLocalErrors((errors) => ({
                                                    ...errors,
                                                    province_id: undefined,
                                                    regency_id: undefined,
                                                    district_id: undefined,
                                                    village_id: undefined,
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
                                            onChange={(value) => {
                                                form.setData((data: any) => ({
                                                    ...data,
                                                    regency_id: value,
                                                    district_id: '',
                                                    village_id: '',
                                                }));
                                                setLocalErrors((errors) => ({
                                                    ...errors,
                                                    regency_id: undefined,
                                                    district_id: undefined,
                                                    village_id: undefined,
                                                }));
                                            }}
                                            placeholder={
                                                loadingRegencies
                                                    ? 'Memuat kota/kabupaten...'
                                                    : form.data.province_id
                                                      ? 'Pilih kota/kabupaten'
                                                      : 'Pilih provinsi dulu'
                                            }
                                            disabled={
                                                !form.data.province_id ||
                                                loadingRegencies
                                            }
                                            options={regencies.map((item) => ({
                                                value: String(item.id),
                                                label: item.name,
                                            }))}
                                        />
                                    </Field>
                                    <Field
                                        label="Kecamatan"
                                        error={mergedErrors.district_id}
                                    >
                                        <Select
                                            value={String(
                                                form.data.district_id,
                                            )}
                                            onChange={(value) => {
                                                form.setData((data: any) => ({
                                                    ...data,
                                                    district_id: value,
                                                    village_id: '',
                                                }));
                                                setLocalErrors((errors) => ({
                                                    ...errors,
                                                    district_id: undefined,
                                                    village_id: undefined,
                                                }));
                                            }}
                                            placeholder={
                                                loadingDistricts
                                                    ? 'Memuat kecamatan...'
                                                    : form.data.regency_id
                                                      ? 'Pilih kecamatan'
                                                      : 'Pilih kota/kabupaten dulu'
                                            }
                                            disabled={
                                                !form.data.regency_id ||
                                                loadingDistricts
                                            }
                                            options={districts.map((item) => ({
                                                value: String(item.id),
                                                label: item.name,
                                            }))}
                                        />
                                    </Field>
                                    <Field
                                        label="Desa/Kelurahan"
                                        error={mergedErrors.village_id}
                                    >
                                        <Select
                                            value={String(form.data.village_id)}
                                            onChange={(value) =>
                                                setData('village_id', value)
                                            }
                                            placeholder={
                                                loadingVillages
                                                    ? 'Memuat desa/kelurahan...'
                                                    : form.data.district_id
                                                      ? 'Pilih desa/kelurahan'
                                                      : 'Pilih kecamatan dulu'
                                            }
                                            disabled={
                                                !form.data.district_id ||
                                                loadingVillages
                                            }
                                            options={villages.map((item) => ({
                                                value: String(item.id),
                                                label: item.name,
                                            }))}
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
                                <div className="border-t border-slate-100 pt-5 dark:border-slate-700">
                                    <p className="mb-4 text-sm font-black text-[#64748B] dark:text-slate-400">
                                        Informasi Pendukung
                                    </p>
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <Field
                                            label="Nomor HP Orang Tua / Wali"
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
                                                placeholder="0812..."
                                            />
                                        </Field>
                                    </div>
                                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                                        <Field
                                            label="Dapat rekomendasi sekolah/lembaga dari?"
                                            error={mergedErrors.referral_source}
                                        >
                                            <Input
                                                value={
                                                    form.data.referral_source
                                                }
                                                onChange={(event) =>
                                                    setData(
                                                        'referral_source',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: SDN 1 Surabaya"
                                            />
                                        </Field>
                                        <Field
                                            label="Ikut dari Cabang Mana?"
                                            error={mergedErrors.branch}
                                        >
                                            <Select
                                                value={String(form.data.branch)}
                                                onChange={(value) =>
                                                    setData('branch', value)
                                                }
                                                placeholder="Pilih cabang"
                                                options={branches.map((b) => ({
                                                    value: b.name,
                                                    label: b.name,
                                                }))}
                                            />
                                        </Field>
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
                                description="Lampirkan bukti transfer pendaftaran dan kartu pelajar."
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FileField
                                        label="Upload Bukti Transfer Pendaftaran"
                                        file={form.data.payment_proof}
                                        error={mergedErrors.payment_proof}
                                        onChange={(file) =>
                                            setFile('payment_proof', file)
                                        }
                                        accept="image/*,.pdf"
                                    />
                                    <FileField
                                        label="Upload Kartu Pelajar/KIA/KK/AKTA"
                                        file={form.data.student_card}
                                        error={mergedErrors.student_card}
                                        onChange={(file) =>
                                            setFile('student_card', file)
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
                                <div className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-5 dark:border-slate-700 dark:bg-slate-800">
                                    <p className="mb-4 text-sm font-black text-[#1E293B] dark:text-white">
                                        Persetujuan Peserta & Wali
                                    </p>
                                    <div>
                                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100 transition hover:ring-[#17524A]/30 dark:bg-slate-900 dark:ring-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    form.data
                                                        .data_truth_consent &&
                                                    form.data
                                                        .documentation_consent &&
                                                    form.data.rules_consent
                                                }
                                                onChange={(event) =>
                                                    setConsentAgreements(
                                                        event.target.checked,
                                                    )
                                                }
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#17524A] dark:border-slate-600"
                                            />
                                            <span className="text-sm leading-7 font-bold text-[#1E293B] dark:text-white">
                                                Saya menyatakan bahwa seluruh
                                                data yang diberikan adalah benar
                                                dan dapat dipertanggungjawabkan,
                                                menyetujui penggunaan
                                                dokumentasi selama kegiatan
                                                OMATIQ berlangsung, serta
                                                bersedia mengikuti seluruh
                                                ketentuan dan jadwal kegiatan.
                                            </span>
                                        </label>
                                    </div>
                                    {(mergedErrors.data_truth_consent ||
                                        mergedErrors.documentation_consent ||
                                        mergedErrors.rules_consent) && (
                                        <p className="mt-3 text-sm font-medium text-destructive">
                                            {mergedErrors.data_truth_consent ||
                                                mergedErrors.documentation_consent ||
                                                mergedErrors.rules_consent ||
                                                'Semua persetujuan wajib dicentang.'}
                                        </p>
                                    )}
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
    value?: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
}) => (
    <UiSelect
        value={value ? String(value) : undefined}
        onValueChange={onChange}
        disabled={disabled}
    >
        <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {options.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                    {item.label}
                </SelectItem>
            ))}
        </SelectContent>
    </UiSelect>
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
