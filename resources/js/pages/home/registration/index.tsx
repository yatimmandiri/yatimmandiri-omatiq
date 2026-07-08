import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpenCheck,
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
import type { LucideIcon } from 'lucide-react';
import { FormEvent, ReactNode, useMemo } from 'react';

type Option = { id: number | string; name: string; category?: string; slug?: string };
type Regency = { id: string; province_id: string; name: string };

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

export default function RegistrationPage() {
    const { olimpiades = [], provinces = [], regencies = [] } =
        usePage<RegistrationProps>().props;

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
                (regency) => regency.province_id === form.data.province_id,
            ),
        [form.data.province_id, regencies],
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/pendaftaran', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const setFile = (name: string, file?: File | null) => {
        form.setData(name, file ?? null);
    };

    return (
        <>
            <section className="relative overflow-hidden px-5 pt-28 pb-12 sm:pt-32 lg:px-8">
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
                            Lengkapi data peserta, program binaan, kategori
                            lomba, dokumen pendukung, dan persetujuan wali.
                        </p>
                    </div>
                    <div className="rounded-[32px] bg-white p-5 shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100 sm:p-7">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                {
                                    icon: UserRound,
                                    title: 'Data Peserta',
                                    text: 'Identitas peserta dan sekolah',
                                },
                                {
                                    icon: School,
                                    title: 'Program Binaan',
                                    text: 'Sanggar, asrama, dan pendamping',
                                },
                                {
                                    icon: Trophy,
                                    title: 'Kategori Lomba',
                                    text: "Matematika atau Al-Qur'an",
                                },
                                {
                                    icon: FileUp,
                                    title: 'Dokumen',
                                    text: 'Upload berkas pendukung',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-3xl bg-[#F8FAFC] p-5"
                                >
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F60AC]/10 text-[#0F60AC]">
                                        <item.icon className="h-6 w-6" />
                                    </span>
                                    <p className="mt-4 font-black text-[#1E293B]">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 py-12 lg:px-8">
                <form onSubmit={submit} className="mx-auto max-w-5xl space-y-8">
                    <FormSection
                        icon={UserRound}
                        title="A. Data Peserta"
                        description="Isi identitas peserta sesuai data yang benar."
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Nama Lengkap Peserta" error={form.errors.full_name}>
                                <Input value={form.data.full_name} onChange={(e) => form.setData('full_name', e.target.value)} required />
                            </Field>
                            <Field label="Nama Panggilan" error={form.errors.nickname}>
                                <Input value={form.data.nickname} onChange={(e) => form.setData('nickname', e.target.value)} />
                            </Field>
                            <Field label="Jenis Kelamin" error={form.errors.gender}>
                                <Select value={form.data.gender} onChange={(value) => form.setData('gender', value)} placeholder="Pilih jenis kelamin" options={[{ value: 'male', label: 'Laki-laki' }, { value: 'female', label: 'Perempuan' }]} />
                            </Field>
                            <Field label="Tempat Lahir" error={form.errors.birth_place}>
                                <Input value={form.data.birth_place} onChange={(e) => form.setData('birth_place', e.target.value)} required />
                            </Field>
                            <Field label="Tanggal Lahir" error={form.errors.birth_date}>
                                <Input type="date" value={form.data.birth_date} onChange={(e) => form.setData('birth_date', e.target.value)} required />
                            </Field>
                            <Field label="Usia" error={form.errors.age}>
                                <Input type="number" min={5} max={20} value={form.data.age} onChange={(e) => form.setData('age', e.target.value)} required />
                            </Field>
                            <Field label="Jenjang Pendidikan" error={form.errors.education_level}>
                                <Select value={form.data.education_level} onChange={(value) => form.setData('education_level', value)} placeholder="Pilih jenjang" options={[{ value: 'SD/MI', label: 'SD/MI' }, { value: 'SMP/MTs', label: 'SMP/MTs' }]} />
                            </Field>
                            <Field label="Kelas" error={form.errors.grade}>
                                <Input value={form.data.grade} onChange={(e) => form.setData('grade', e.target.value)} placeholder="Contoh: 5 / 8" required />
                            </Field>
                            <Field label="Nama Sekolah" error={form.errors.school_name}>
                                <Input value={form.data.school_name} onChange={(e) => form.setData('school_name', e.target.value)} required />
                            </Field>
                            <Field label="Nomor HP Orang Tua/Wali/Pendamping" error={form.errors.parent_phone}>
                                <Input value={form.data.parent_phone} onChange={(e) => form.setData('parent_phone', e.target.value)} required />
                            </Field>
                        </div>
                        <Field label="Alamat Lengkap" error={form.errors.address}>
                            <Textarea rows={4} value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} required />
                        </Field>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Provinsi" error={form.errors.province_id}>
                                <Select
                                    value={form.data.province_id}
                                    onChange={(value) => {
                                        form.setData('province_id', value);
                                        form.setData('regency_id', '');
                                    }}
                                    placeholder="Pilih provinsi"
                                    options={provinces.map((item) => ({ value: String(item.id), label: item.name }))}
                                />
                            </Field>
                            <Field label="Kota/Kabupaten" error={form.errors.regency_id}>
                                <Select
                                    value={form.data.regency_id}
                                    onChange={(value) => form.setData('regency_id', value)}
                                    placeholder="Pilih kota/kabupaten"
                                    options={filteredRegencies.map((item) => ({ value: item.id, label: item.name }))}
                                />
                            </Field>
                        </div>
                    </FormSection>

                    <FormSection
                        icon={School}
                        title="B. Data Program Binaan"
                        description="Lengkapi informasi program binaan, sanggar/asrama, cabang, dan pendamping."
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Program Binaan" error={form.errors.development_program}>
                                <Select value={form.data.development_program} onChange={(value) => form.setData('development_program', value)} placeholder="Pilih program binaan" options={programOptions} />
                            </Field>
                            {form.data.development_program === 'other' && (
                                <Field label="Program Lainnya" error={form.errors.development_program_other}>
                                    <Input value={form.data.development_program_other} onChange={(e) => form.setData('development_program_other', e.target.value)} required />
                                </Field>
                            )}
                            <Field label="Nama Sanggar / Asrama" error={form.errors.institution_name}>
                                <Input value={form.data.institution_name} onChange={(e) => form.setData('institution_name', e.target.value)} />
                            </Field>
                            <Field label="Kantor Layanan / Cabang" error={form.errors.branch_office}>
                                <Input value={form.data.branch_office} onChange={(e) => form.setData('branch_office', e.target.value)} />
                            </Field>
                            <Field label="Nama Guru / Pendamping" error={form.errors.mentor_name}>
                                <Input value={form.data.mentor_name} onChange={(e) => form.setData('mentor_name', e.target.value)} />
                            </Field>
                            <Field label="Nomor HP Guru / Pendamping" error={form.errors.mentor_phone}>
                                <Input value={form.data.mentor_phone} onChange={(e) => form.setData('mentor_phone', e.target.value)} />
                            </Field>
                        </div>
                    </FormSection>

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
                                    onClick={() => form.setData('olimpiade_id', String(item.id))}
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
                        {form.errors.olimpiade_id && (
                            <p className="text-sm font-medium text-destructive">
                                {form.errors.olimpiade_id}
                            </p>
                        )}
                    </FormSection>

                    <FormSection
                        icon={Medal}
                        title="D. Prestasi & Pengalaman"
                        description="Ceritakan prestasi akademik/non-akademik dan pengalaman mengikuti OMATIQ sebelumnya."
                    >
                        <Field label="Prestasi Akademik / Non Akademik" error={form.errors.achievements}>
                            <Textarea rows={5} value={form.data.achievements} onChange={(e) => form.setData('achievements', e.target.value)} placeholder="Tuliskan prestasi atau pengalaman yang pernah diraih." />
                        </Field>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Pernah Mengikuti OMATIQ Sebelumnya?" error={form.errors.has_joined_before}>
                                <Select value={form.data.has_joined_before ? '1' : '0'} onChange={(value) => form.setData('has_joined_before', value === '1')} placeholder="Pilih jawaban" options={[{ value: '0', label: 'Tidak' }, { value: '1', label: 'Ya' }]} />
                            </Field>
                            {form.data.has_joined_before && (
                                <Field label="Jika Ya, Tahun" error={form.errors.previous_year}>
                                    <Input type="number" min={2016} max={new Date().getFullYear()} value={form.data.previous_year} onChange={(e) => form.setData('previous_year', e.target.value)} />
                                </Field>
                            )}
                        </div>
                    </FormSection>

                    <FormSection
                        icon={FileUp}
                        title="E. Dokumen Pendukung"
                        description="Lampirkan file pendukung. Sertifikat prestasi boleh dikosongkan jika belum ada."
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <FileField label="Upload Pas Foto" error={form.errors.photo} onChange={(file) => setFile('photo', file)} accept="image/*" />
                            <FileField label="Upload Kartu Pelajar / Identitas" error={form.errors.identity_card} onChange={(file) => setFile('identity_card', file)} accept="image/*,.pdf" />
                            <FileField label="Upload Surat Rekomendasi" error={form.errors.recommendation_letter} onChange={(file) => setFile('recommendation_letter', file)} accept="image/*,.pdf" />
                            <FileField label="Upload Sertifikat Prestasi (Jika Ada)" error={form.errors.achievement_certificate} onChange={(file) => setFile('achievement_certificate', file)} accept="image/*,.pdf" />
                        </div>
                    </FormSection>

                    <FormSection
                        icon={HeartHandshake}
                        title="F. Persetujuan Peserta & Wali"
                        description="Pastikan seluruh data benar dan peserta siap mengikuti rangkaian OMATIQ."
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Tanda Tangan Peserta (Nama Lengkap)" error={form.errors.participant_signature_name}>
                                <Input value={form.data.participant_signature_name} onChange={(e) => form.setData('participant_signature_name', e.target.value)} required />
                            </Field>
                            <Field label="Tanda Tangan Orang Tua/Wali/Pendamping" error={form.errors.guardian_signature_name}>
                                <Input value={form.data.guardian_signature_name} onChange={(e) => form.setData('guardian_signature_name', e.target.value)} required />
                            </Field>
                        </div>
                        <div className="space-y-3">
                            <Consent checked={form.data.data_truth_consent} onChange={(checked) => form.setData('data_truth_consent', checked)} text="Saya menyatakan bahwa seluruh data yang diberikan adalah benar dan dapat dipertanggungjawabkan." error={form.errors.data_truth_consent} />
                            <Consent checked={form.data.documentation_consent} onChange={(checked) => form.setData('documentation_consent', checked)} text="Saya menyetujui penggunaan dokumentasi selama kegiatan OMATIQ berlangsung." error={form.errors.documentation_consent} />
                            <Consent checked={form.data.rules_consent} onChange={(checked) => form.setData('rules_consent', checked)} text="Saya bersedia mengikuti seluruh ketentuan dan jadwal kegiatan OMATIQ." error={form.errors.rules_consent} />
                        </div>
                    </FormSection>

                    <div className="sticky bottom-4 z-20 rounded-3xl bg-white/90 p-4 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm leading-7 font-bold text-[#64748B]">
                                Periksa kembali semua data sebelum mengirim pendaftaran.
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
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Kirim Pendaftaran
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
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
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: Array<{ value: string; label: string }>;
}) => (
    <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#1E293B] outline-none transition focus:border-[#F15F23] focus:bg-white"
        required
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
    onChange,
}: {
    label: string;
    error?: string;
    accept: string;
    onChange: (file?: File | null) => void;
}) => (
    <div className="space-y-2">
        <Label className="font-black text-[#1E293B]">{label}</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-[#F8FAFC] px-5 py-8 text-center transition hover:border-[#F15F23] hover:bg-[#FFF1EA]">
            <FileUp className="h-7 w-7 text-[#F15F23]" />
            <span className="mt-3 text-sm font-black text-[#1E293B]">
                Pilih file
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
