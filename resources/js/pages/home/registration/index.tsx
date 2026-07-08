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
    Medal,
    Save,
    School,
    Sparkles,
    Trophy,
    UserRound,
} from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

type Option = { id: number | string; name: string; category?: string; slug?: string };
type Regency = { id: number | string; province_id: number | string; name: string };
type RegistrationErrors = Record<string, string | undefined>;

type RegistrationProps = {
    olimpiades?: Option[];
    provinces?: Option[];
    regencies?: Regency[];
};

const programOptions = [
    { value: 'sanggar_genius', label: 'Sanggar Genius' },
    { value: 'sanggar_alquran', label: "Sanggar Al-Qur'an" },
    { value: 'asrama_yatim_mandiri', label: 'Asrama Yatim Mandiri' },
    { value: 'other', label: 'Program Lainnya' },
];

const steps = [
    {
        title: 'Data Peserta',
        description: 'Identitas peserta, sekolah, alamat, dan wilayah.',
        icon: UserRound,
        fields: [
            'full_name',
            'gender',
            'birth_place',
            'birth_date',
            'age',
            'education_level',
            'school_name',
            'grade',
            'address',
            'province_id',
            'regency_id',
            'parent_phone',
        ],
    },
    {
        title: 'Program Binaan',
        description: 'Sanggar, asrama, cabang, dan pendamping peserta.',
        icon: School,
        fields: [
            'development_program',
            'development_program_other',
            'institution_name',
            'branch_office',
            'mentor_name',
            'mentor_phone',
        ],
    },
    {
        title: 'Kategori Lomba',
        description: "Pilih olimpiade Matematika atau Al-Qur'an.",
        icon: Trophy,
        fields: ['olimpiade_id'],
    },
    {
        title: 'Prestasi',
        description: 'Prestasi dan pengalaman mengikuti OMATIQ sebelumnya.',
        icon: Medal,
        fields: ['previous_year'],
    },
    {
        title: 'Dokumen',
        description: 'Upload berkas pendukung pendaftaran.',
        icon: FileUp,
        fields: ['photo', 'identity_card', 'recommendation_letter', 'achievement_certificate'],
    },
    {
        title: 'Persetujuan',
        description: 'Konfirmasi data dan persetujuan peserta serta wali.',
        icon: HeartHandshake,
        fields: [
            'participant_signature_name',
            'guardian_signature_name',
            'data_truth_consent',
            'documentation_consent',
            'rules_consent',
        ],
    },
];

export default function RegistrationPage() {
    const { olimpiades = [], provinces = [], regencies = [] } =
        usePage<RegistrationProps>().props;

    const [currentStep, setCurrentStep] = useState(0);
    const [localErrors, setLocalErrors] = useState<RegistrationErrors>({});

    const form = useForm<any>({
        full_name: '',
        nickname: '',
        gender: '',
        birth_place: '',
        birth_date: '',
        age: '',
        education_level: '',
        school_name: '',
        grade: '',
        address: '',
        province_id: '',
        regency_id: '',
        parent_phone: '',
        development_program: '',
        development_program_other: '',
        institution_name: '',
        branch_office: '',
        mentor_name: '',
        mentor_phone: '',
        olimpiade_id: '',
        achievements: '',
        has_joined_before: false,
        previous_year: '',
        photo: null,
        identity_card: null,
        recommendation_letter: null,
        achievement_certificate: null,
        data_truth_consent: false,
        documentation_consent: false,
        rules_consent: false,
        participant_signature_name: '',
        guardian_signature_name: '',
    });

    const filteredRegencies = useMemo(
        () =>
            regencies.filter(
                (regency) =>
                    String(regency.province_id) === String(form.data.province_id),
            ),
        [form.data.province_id, regencies],
    );

    const mergedErrors = { ...localErrors, ...(form.errors as RegistrationErrors) };
    const isLastStep = currentStep === steps.length - 1;

    useEffect(() => {
        const serverErrorKeys = Object.keys(form.errors);

        if (!serverErrorKeys.length) {
            return;
        }

        const targetStep = steps.findIndex((step) =>
            step.fields.some((field) => serverErrorKeys.includes(field)),
        );

        if (targetStep >= 0) {
            setCurrentStep(targetStep);
            scrollToForm();
        }
    }, [form.errors]);

    const scrollToForm = () => {
        window.requestAnimationFrame(() => {
            document
                .getElementById('registration-form')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

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
            required('full_name', 'Nama lengkap wajib diisi.');
            required('gender', 'Jenis kelamin wajib dipilih.');
            required('birth_place', 'Tempat lahir wajib diisi.');
            required('birth_date', 'Tanggal lahir wajib diisi.');
            required('age', 'Usia wajib diisi.');
            required('education_level', 'Jenjang pendidikan wajib dipilih.');
            required('school_name', 'Nama sekolah wajib diisi.');
            required('grade', 'Kelas wajib diisi.');
            required('address', 'Alamat lengkap wajib diisi.');
            required('province_id', 'Provinsi wajib dipilih.');
            required('regency_id', 'Kota/kabupaten wajib dipilih.');
            required('parent_phone', 'Nomor HP orang tua/wali wajib diisi.');
        }

        if (step === 1) {
            required('development_program', 'Program binaan wajib dipilih.');
            if (form.data.development_program === 'other') {
                required('development_program_other', 'Program lainnya wajib diisi.');
            }
            required('institution_name', 'Nama sanggar/asrama wajib diisi.');
            required('branch_office', 'Kantor layanan/cabang wajib diisi.');
            required('mentor_name', 'Nama guru/pendamping wajib diisi.');
            required('mentor_phone', 'Nomor HP guru/pendamping wajib diisi.');
        }

        if (step === 2) {
            required('olimpiade_id', 'Kategori olimpiade wajib dipilih.');
        }

        if (step === 3 && form.data.has_joined_before) {
            required('previous_year', 'Tahun mengikuti OMATIQ sebelumnya wajib diisi.');
        }

        if (step === 4) {
            required('photo', 'Pas foto wajib diupload.');
            required('identity_card', 'Kartu pelajar/identitas wajib diupload.');
            required('recommendation_letter', 'Surat rekomendasi wajib diupload.');
        }

        if (step === 5) {
            required('participant_signature_name', 'Nama tanda tangan peserta wajib diisi.');
            required('guardian_signature_name', 'Nama tanda tangan wali wajib diisi.');

            if (!form.data.data_truth_consent) {
                errors.data_truth_consent = 'Persetujuan kebenaran data wajib dicentang.';
            }

            if (!form.data.documentation_consent) {
                errors.documentation_consent = 'Persetujuan dokumentasi wajib dicentang.';
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

    return (
        <>
            <section className="relative overflow-hidden px-5 pt-28 pb-10 sm:pt-32 lg:px-8">
                <div className="absolute top-20 left-0 h-52 w-52 rounded-[56px] bg-[#F15F23]/15 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-64 w-64 rounded-[64px] bg-[#56CCF2]/20 blur-3xl" />
                <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <Link
                            href="/olimpiade"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#0F60AC] shadow-sm ring-1 ring-slate-100"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Olimpiade
                        </Link>
                        <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">
                            <Medal className="h-4 w-4" />
                            Form Pendaftaran OMATIQ 2026
                        </span>
                        <h1 className="mt-6 text-3xl leading-tight font-black text-[#1E293B] sm:text-5xl lg:text-6xl">
                            Saatnya tunjukkan potensi terbaikmu!
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-[#64748B] sm:text-lg">
                            Daftarkan dirimu menjadi bagian dari OMATIQ 2026.
                            Isi formulir bertahap agar proses pendaftaran lebih
                            ringan, rapi, dan mudah diperiksa.
                        </p>
                    </div>
                    <div className="rounded-[32px] bg-white p-5 shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100 sm:p-7">
                        <div className="mb-5 flex items-center gap-4">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F60AC]/10 text-[#0F60AC]">
                                <StepIcon className="h-7 w-7" />
                            </span>
                            <div>
                                <p className="text-sm font-black text-[#F15F23]">
                                    Step {currentStep + 1} dari {steps.length}
                                </p>
                                <p className="text-xl font-black text-[#1E293B]">
                                    {currentStepData.title}
                                </p>
                            </div>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-[#F15F23] transition-all duration-500"
                                style={{
                                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                                }}
                            />
                        </div>
                        <p className="mt-5 text-sm leading-7 font-semibold text-[#64748B]">
                            {currentStepData.description}
                        </p>
                    </div>
                </div>
            </section>

            <section id="registration-form" className="px-5 py-10 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[320px_1fr]">
                    <aside className="lg:sticky lg:top-28 lg:self-start">
                        <div className="rounded-[32px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
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
                                                    ? 'bg-[#FFF1EA] text-[#F15F23]'
                                                    : 'text-[#64748B] hover:bg-[#F8FAFC]'
                                            }`}
                                        >
                                            <span
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                    isDone
                                                        ? 'bg-[#22C55E] text-white'
                                                        : isActive
                                                          ? 'bg-[#F15F23] text-white'
                                                          : 'bg-[#F8FAFC] text-[#0F60AC]'
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
                                description="Isi identitas peserta sesuai data yang benar."
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field label="Nama Lengkap Peserta" error={mergedErrors.full_name}>
                                        <Input value={form.data.full_name} onChange={(event) => setData('full_name', event.target.value)} />
                                    </Field>
                                    <Field label="Nama Panggilan" error={mergedErrors.nickname}>
                                        <Input value={form.data.nickname} onChange={(event) => setData('nickname', event.target.value)} />
                                    </Field>
                                    <Field label="Jenis Kelamin" error={mergedErrors.gender}>
                                        <Select value={form.data.gender} onChange={(value) => setData('gender', value)} placeholder="Pilih jenis kelamin" options={[{ value: 'male', label: 'Laki-laki' }, { value: 'female', label: 'Perempuan' }]} />
                                    </Field>
                                    <Field label="Tempat Lahir" error={mergedErrors.birth_place}>
                                        <Input value={form.data.birth_place} onChange={(event) => setData('birth_place', event.target.value)} />
                                    </Field>
                                    <Field label="Tanggal Lahir" error={mergedErrors.birth_date}>
                                        <Input type="date" value={form.data.birth_date} onChange={(event) => setData('birth_date', event.target.value)} />
                                    </Field>
                                    <Field label="Usia" error={mergedErrors.age}>
                                        <Input type="number" min={5} max={20} value={form.data.age} onChange={(event) => setData('age', event.target.value)} />
                                    </Field>
                                    <Field label="Jenjang Pendidikan" error={mergedErrors.education_level}>
                                        <Select value={form.data.education_level} onChange={(value) => setData('education_level', value)} placeholder="Pilih jenjang" options={[{ value: 'SD/MI', label: 'SD/MI' }, { value: 'SMP/MTs', label: 'SMP/MTs' }]} />
                                    </Field>
                                    <Field label="Kelas" error={mergedErrors.grade}>
                                        <Input value={form.data.grade} onChange={(event) => setData('grade', event.target.value)} placeholder="Contoh: 5 / 8" />
                                    </Field>
                                    <Field label="Nama Sekolah" error={mergedErrors.school_name}>
                                        <Input value={form.data.school_name} onChange={(event) => setData('school_name', event.target.value)} />
                                    </Field>
                                    <Field label="Nomor HP Orang Tua/Wali/Pendamping" error={mergedErrors.parent_phone}>
                                        <Input value={form.data.parent_phone} onChange={(event) => setData('parent_phone', event.target.value)} />
                                    </Field>
                                </div>
                                <Field label="Alamat Lengkap" error={mergedErrors.address}>
                                    <Textarea rows={4} value={form.data.address} onChange={(event) => setData('address', event.target.value)} />
                                </Field>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field label="Provinsi" error={mergedErrors.province_id}>
                                        <Select
                                            value={String(form.data.province_id)}
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
                                    <Field label="Kota/Kabupaten" error={mergedErrors.regency_id}>
                                        <Select
                                            value={String(form.data.regency_id)}
                                            onChange={(value) => setData('regency_id', value)}
                                            placeholder={
                                                form.data.province_id
                                                    ? 'Pilih kota/kabupaten'
                                                    : 'Pilih provinsi dulu'
                                            }
                                            disabled={!form.data.province_id}
                                            options={filteredRegencies.map((item) => ({
                                                value: String(item.id),
                                                label: item.name,
                                            }))}
                                        />
                                    </Field>
                                </div>
                            </FormSection>
                        )}

                        {currentStep === 1 && (
                            <FormSection
                                icon={School}
                                title="B. Data Program Binaan"
                                description="Lengkapi informasi program binaan, sanggar/asrama, cabang, dan pendamping."
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field label="Program Binaan" error={mergedErrors.development_program}>
                                        <Select value={form.data.development_program} onChange={(value) => setData('development_program', value)} placeholder="Pilih program binaan" options={programOptions} />
                                    </Field>
                                    {form.data.development_program === 'other' && (
                                        <Field label="Program Lainnya" error={mergedErrors.development_program_other}>
                                            <Input value={form.data.development_program_other} onChange={(event) => setData('development_program_other', event.target.value)} />
                                        </Field>
                                    )}
                                    <Field label="Nama Sanggar / Asrama" error={mergedErrors.institution_name}>
                                        <Input value={form.data.institution_name} onChange={(event) => setData('institution_name', event.target.value)} />
                                    </Field>
                                    <Field label="Kantor Layanan / Cabang" error={mergedErrors.branch_office}>
                                        <Input value={form.data.branch_office} onChange={(event) => setData('branch_office', event.target.value)} />
                                    </Field>
                                    <Field label="Nama Guru / Pendamping" error={mergedErrors.mentor_name}>
                                        <Input value={form.data.mentor_name} onChange={(event) => setData('mentor_name', event.target.value)} />
                                    </Field>
                                    <Field label="Nomor HP Guru / Pendamping" error={mergedErrors.mentor_phone}>
                                        <Input value={form.data.mentor_phone} onChange={(event) => setData('mentor_phone', event.target.value)} />
                                    </Field>
                                </div>
                            </FormSection>
                        )}

                        {currentStep === 2 && (
                            <FormSection
                                icon={Trophy}
                                title="C. Kategori Lomba"
                                description="Pilih cabang olimpiade yang akan diikuti peserta."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    {olimpiades.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setData('olimpiade_id', String(item.id))}
                                            className={`rounded-3xl border p-5 text-left transition hover:-translate-y-1 ${
                                                form.data.olimpiade_id === String(item.id)
                                                    ? 'border-[#F15F23] bg-[#FFF1EA] shadow-lg shadow-[#F15F23]/10'
                                                    : 'border-slate-100 bg-[#F8FAFC]'
                                            }`}
                                        >
                                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#F15F23] shadow-sm">
                                                {`${item.name} ${item.category}`.toLowerCase().includes('qur') ? (
                                                    <BookOpenCheck className="h-6 w-6" />
                                                ) : (
                                                    <Trophy className="h-6 w-6" />
                                                )}
                                            </span>
                                            <p className="mt-4 text-lg font-black text-[#1E293B]">
                                                {item.name}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[#64748B]">
                                                {item.category}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                {mergedErrors.olimpiade_id && (
                                    <p className="text-sm font-medium text-destructive">
                                        {mergedErrors.olimpiade_id}
                                    </p>
                                )}
                            </FormSection>
                        )}

                        {currentStep === 3 && (
                            <FormSection
                                icon={Medal}
                                title="D. Prestasi & Pengalaman"
                                description="Ceritakan prestasi akademik/non-akademik dan pengalaman mengikuti OMATIQ sebelumnya."
                            >
                                <Field label="Prestasi Akademik / Non Akademik" error={mergedErrors.achievements}>
                                    <Textarea rows={5} value={form.data.achievements} onChange={(event) => setData('achievements', event.target.value)} placeholder="Tuliskan prestasi atau pengalaman yang pernah diraih." />
                                </Field>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field label="Pernah Mengikuti OMATIQ Sebelumnya?" error={mergedErrors.has_joined_before}>
                                        <Select value={form.data.has_joined_before ? '1' : '0'} onChange={(value) => setData('has_joined_before', value === '1')} placeholder="Pilih jawaban" options={[{ value: '0', label: 'Tidak' }, { value: '1', label: 'Ya' }]} />
                                    </Field>
                                    {form.data.has_joined_before && (
                                        <Field label="Jika Ya, Tahun" error={mergedErrors.previous_year}>
                                            <Input type="number" min={2016} max={new Date().getFullYear()} value={form.data.previous_year} onChange={(event) => setData('previous_year', event.target.value)} />
                                        </Field>
                                    )}
                                </div>
                            </FormSection>
                        )}

                        {currentStep === 4 && (
                            <FormSection
                                icon={FileUp}
                                title="E. Dokumen Pendukung"
                                description="Lampirkan file pendukung. Sertifikat prestasi boleh dikosongkan jika belum ada."
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FileField label="Upload Pas Foto" file={form.data.photo} error={mergedErrors.photo} onChange={(file) => setFile('photo', file)} accept="image/*" />
                                    <FileField label="Upload Kartu Pelajar / Identitas" file={form.data.identity_card} error={mergedErrors.identity_card} onChange={(file) => setFile('identity_card', file)} accept="image/*,.pdf" />
                                    <FileField label="Upload Surat Rekomendasi" file={form.data.recommendation_letter} error={mergedErrors.recommendation_letter} onChange={(file) => setFile('recommendation_letter', file)} accept="image/*,.pdf" />
                                    <FileField label="Upload Sertifikat Prestasi (Jika Ada)" file={form.data.achievement_certificate} error={mergedErrors.achievement_certificate} onChange={(file) => setFile('achievement_certificate', file)} accept="image/*,.pdf" />
                                </div>
                            </FormSection>
                        )}

                        {currentStep === 5 && (
                            <FormSection
                                icon={HeartHandshake}
                                title="F. Persetujuan Peserta & Wali"
                                description="Pastikan seluruh data benar dan peserta siap mengikuti rangkaian OMATIQ."
                            >
                                <div className="rounded-3xl bg-[#F8FAFC] p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-[#22C55E]" />
                                        <p className="font-black text-[#1E293B]">
                                            Pemeriksaan terakhir sebelum dikirim
                                        </p>
                                    </div>
                                    <div className="grid gap-3 text-sm font-bold text-[#64748B] sm:grid-cols-2">
                                        <p>Peserta: {form.data.full_name || '-'}</p>
                                        <p>Sekolah: {form.data.school_name || '-'}</p>
                                        <p>Jenjang: {form.data.education_level || '-'}</p>
                                        <p>HP Wali: {form.data.parent_phone || '-'}</p>
                                    </div>
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field label="Tanda Tangan Peserta (Nama Lengkap)" error={mergedErrors.participant_signature_name}>
                                        <Input value={form.data.participant_signature_name} onChange={(event) => setData('participant_signature_name', event.target.value)} />
                                    </Field>
                                    <Field label="Tanda Tangan Orang Tua/Wali/Pendamping" error={mergedErrors.guardian_signature_name}>
                                        <Input value={form.data.guardian_signature_name} onChange={(event) => setData('guardian_signature_name', event.target.value)} />
                                    </Field>
                                </div>
                                <div className="space-y-3">
                                    <Consent checked={form.data.data_truth_consent} onChange={(checked) => setData('data_truth_consent', checked)} text="Saya menyatakan bahwa seluruh data yang diberikan adalah benar dan dapat dipertanggungjawabkan." error={mergedErrors.data_truth_consent} />
                                    <Consent checked={form.data.documentation_consent} onChange={(checked) => setData('documentation_consent', checked)} text="Saya menyetujui penggunaan dokumentasi selama kegiatan OMATIQ berlangsung." error={mergedErrors.documentation_consent} />
                                    <Consent checked={form.data.rules_consent} onChange={(checked) => setData('rules_consent', checked)} text="Saya bersedia mengikuti seluruh ketentuan dan jadwal kegiatan OMATIQ." error={mergedErrors.rules_consent} />
                                </div>
                            </FormSection>
                        )}

                        <div className="sticky bottom-4 z-20 rounded-3xl bg-white/90 p-4 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={previousStep}
                                    disabled={currentStep === 0 || form.processing}
                                    className="rounded-xl px-5 py-6 text-sm font-black"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Sebelumnya
                                </Button>
                                <p className="text-center text-sm leading-7 font-bold text-[#64748B]">
                                    Step {currentStep + 1} dari {steps.length}
                                </p>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-[#F15F23] px-6 py-6 text-sm font-black text-white hover:bg-[#d94f18]"
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
    <section className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
        <div className="mb-6 flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F60AC]/10 text-[#0F60AC]">
                <Icon className="h-6 w-6" />
            </span>
            <div>
                <h2 className="text-2xl font-black text-[#1E293B]">{title}</h2>
                <p className="mt-1 text-sm leading-7 text-[#64748B]">
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
        <Label className="font-black text-[#1E293B]">{label}</Label>
        {children}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
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
        className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#1E293B] outline-none transition focus:border-[#F15F23] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
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
        <Label className="font-black text-[#1E293B]">{label}</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-[#F8FAFC] px-5 py-8 text-center transition hover:border-[#F15F23] hover:bg-[#FFF1EA]">
            <FileUp className="h-7 w-7 text-[#F15F23]" />
            <span className="mt-3 text-sm font-black text-[#1E293B]">
                {file?.name ?? 'Pilih file'}
            </span>
            <span className="mt-1 text-xs font-semibold text-[#64748B]">
                JPG, PNG, atau PDF sesuai kebutuhan
            </span>
            <input
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(event) => onChange(event.target.files?.[0])}
            />
        </label>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
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
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#F8FAFC] p-4">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#F15F23]"
            />
            <span className="text-sm leading-7 font-bold text-[#1E293B]">
                {text}
            </span>
        </label>
        {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
    </div>
);
