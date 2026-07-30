import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import participants from '@/routes/admin/companies/participants';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, ReactNode, useMemo } from 'react';

type Option = { id: number | string; name: string; category?: string };
type Regency = { id: string; province_id: string; name: string };

const statusOptions = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
];

const dateValue = (value?: string | null) => value?.slice(0, 10) ?? '';

export function ParticipantForm({ dataId }: { dataId: number }) {
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

    const student = participant?.student;
    const form = useForm<any>({
        olimpiade_id: participant?.olimpiade_id ? String(participant.olimpiade_id) : '',
        nik: student?.nik ?? '',
        full_name: student?.full_name ?? '',
        nickname: student?.nickname ?? '',
        gender: student?.gender ?? '',
        birth_place: student?.birth_place ?? '',
        birth_date: dateValue(student?.birth_date),
        age: student?.age ?? '',
        education_level: student?.education_level ?? '',
        school_name: student?.school_name ?? '',
        grade: student?.grade ?? '',
        address: student?.address ?? '',
        province_id: student?.province_id ?? '',
        regency_id: student?.regency_id ?? '',
        parent_phone: student?.parent_phone ?? '',
        mentor_name: student?.mentor_name ?? '',
        mentor_phone: student?.mentor_phone ?? '',
        achievements: participant?.achievements ?? '',
        has_joined_before: participant?.has_joined_before ?? false,
        previous_year: participant?.previous_year ?? '',
        photo: null,
        identity_card: null,
        family_card: null,
        referral_source: participant?.referral_source ?? '',
        referral_source_other: participant?.referral_source_other ?? '',
        payment_status: participant?.payment_status ?? 'unpaid',
        payment_amount: participant?.payment_amount ?? '',
        payment_note: participant?.payment_note ?? '',
        payment_proof: null,
        data_truth_consent: participant?.data_truth_consent ?? false,
        documentation_consent: participant?.documentation_consent ?? false,
        rules_consent: participant?.rules_consent ?? false,
        participant_signature_name: participant?.participant_signature_name ?? '',
        guardian_signature_name: participant?.guardian_signature_name ?? '',
        status: participant?.status ?? 'submitted',
        notes: participant?.notes ?? '',
    });

    form.transform((data: any) => ({
        ...data,
        _method: 'put',
        has_joined_before: data.has_joined_before ? 1 : 0,
        data_truth_consent: data.data_truth_consent ? 1 : 0,
        documentation_consent: data.documentation_consent ? 1 : 0,
        rules_consent: data.rules_consent ? 1 : 0,
    }));

    const filteredRegencies = useMemo(
        () =>
            regencies.filter(
                (regency) =>
                    String(regency.province_id) === String(form.data.province_id),
            ),
        [form.data.province_id, regencies],
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(participants.update(dataId).url, {
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

    const setFile = (name: string, file?: File | null) => {
        form.setData(name, file ?? null);
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Edit Peserta</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {participant.registration_number} - {student?.full_name ?? participant.nik}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
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
                        <Input value={form.data.nik} onChange={(e) => form.setData('nik', e.target.value.replace(/\D/g, '').slice(0, 16))} maxLength={16} placeholder="16 digit NIK" />
                    </Field>
                    <Field label="Nama Lengkap" error={error('full_name')}>
                        <Input value={form.data.full_name} onChange={(e) => form.setData('full_name', e.target.value)} required />
                    </Field>
                    <Field label="Nama Panggilan" error={error('nickname')}>
                        <Input value={form.data.nickname} onChange={(e) => form.setData('nickname', e.target.value)} />
                    </Field>
                    <Field label="Jenis Kelamin" error={error('gender')}>
                        <Select value={form.data.gender} onChange={(value) => form.setData('gender', value)} options={[{ value: 'male', label: 'Laki-laki' }, { value: 'female', label: 'Perempuan' }]} />
                    </Field>
                    <Field label="Tempat Lahir" error={error('birth_place')}>
                        <Input value={form.data.birth_place} onChange={(e) => form.setData('birth_place', e.target.value)} required />
                    </Field>
                    <Field label="Tanggal Lahir" error={error('birth_date')}>
                        <Input type="date" value={form.data.birth_date} onChange={(e) => form.setData('birth_date', e.target.value)} required />
                    </Field>
                    <Field label="Usia" error={error('age')}>
                        <Input type="number" value={form.data.age} onChange={(e) => form.setData('age', e.target.value)} required />
                    </Field>
                    <Field label="Jenjang" error={error('education_level')}>
                        <Select value={form.data.education_level} onChange={(value) => form.setData('education_level', value)} options={[{ value: 'SD/MI', label: 'SD/MI' }, { value: 'SMP/MTs', label: 'SMP/MTs' }]} />
                    </Field>
                    <Field label="Kelas" error={error('grade')}>
                        <Input value={form.data.grade} onChange={(e) => form.setData('grade', e.target.value)} required />
                    </Field>
                    <Field label="Nama Sekolah" error={error('school_name')}>
                        <Input value={form.data.school_name} onChange={(e) => form.setData('school_name', e.target.value)} required />
                    </Field>
                    <Field label="HP Orang Tua/Wali" error={error('parent_phone')}>
                        <Input value={form.data.parent_phone} onChange={(e) => form.setData('parent_phone', e.target.value)} required />
                    </Field>
                </div>
                <Field label="Alamat" error={error('address')}>
                    <Textarea rows={3} value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} required />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Provinsi" error={error('province_id')}>
                        <Select value={form.data.province_id} onChange={(value) => { form.setData('province_id', value); form.setData('regency_id', ''); }} options={provinces.map((item) => ({ value: String(item.id), label: item.name }))} />
                    </Field>
                    <Field label="Kota/Kabupaten" error={error('regency_id')}>
                        <Select value={form.data.regency_id} onChange={(value) => form.setData('regency_id', value)} options={filteredRegencies.map((item) => ({ value: item.id, label: item.name }))} />
                    </Field>
                </div>
            </Card>

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-bold">Kategori, Status, dan Referensi</h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Kategori Lomba" error={error('olimpiade_id')}>
                        <Select value={form.data.olimpiade_id} onChange={(value) => form.setData('olimpiade_id', value)} options={olimpiades.map((item) => ({ value: String(item.id), label: item.name }))} />
                    </Field>
                    <Field label="Nama Pendamping" error={error('mentor_name')}>
                        <Input value={form.data.mentor_name} onChange={(e) => form.setData('mentor_name', e.target.value)} />
                    </Field>
                    <Field label="HP Pendamping" error={error('mentor_phone')}>
                        <Input value={form.data.mentor_phone} onChange={(e) => form.setData('mentor_phone', e.target.value)} />
                    </Field>
                    <Field label="Referensi" error={error('referral_source')}>
                        <Select value={form.data.referral_source} onChange={(value) => form.setData('referral_source', value)} options={[{ value: '', label: 'Pilih data' }, { value: 'social_media', label: 'Media Sosial' }, { value: 'friend', label: 'Teman/Keluarga' }, { value: 'school', label: 'Sekolah' }, { value: 'event', label: 'Acara OMATIQ' }, { value: 'other', label: 'Lainnya' }]} />
                    </Field>
                    {form.data.referral_source === 'other' && (
                        <Field label="Referensi Lainnya" error={error('referral_source_other')}>
                            <Input value={form.data.referral_source_other} onChange={(e) => form.setData('referral_source_other', e.target.value)} />
                        </Field>
                    )}
                    <Field label="Status" error={error('status')}>
                        <Select value={form.data.status} onChange={(value) => form.setData('status', value)} options={statusOptions} />
                    </Field>
                </div>
                <Field label="Catatan Admin" error={error('notes')}>
                    <Textarea rows={3} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                </Field>
            </Card>

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-bold">Prestasi, Dokumen, dan Persetujuan</h2>
                <Field label="Prestasi" error={error('achievements')}>
                    <Textarea rows={4} value={form.data.achievements} onChange={(e) => form.setData('achievements', e.target.value)} />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Pernah Ikut OMATIQ?" error={error('has_joined_before')}>
                        <Select value={form.data.has_joined_before ? '1' : '0'} onChange={(value) => form.setData('has_joined_before', value === '1')} options={[{ value: '0', label: 'Tidak' }, { value: '1', label: 'Ya' }]} />
                    </Field>
                    {form.data.has_joined_before && (
                        <Field label="Tahun Sebelumnya" error={error('previous_year')}>
                            <Input type="number" value={form.data.previous_year} onChange={(e) => form.setData('previous_year', e.target.value)} />
                        </Field>
                    )}
                    <FileField label="Ganti Pas Foto" current={student?.photo_url} onChange={(file) => setFile('photo', file)} error={form.errors.photo} />
                    <FileField label="Ganti Identitas" current={student?.identity_card_url} onChange={(file) => setFile('identity_card', file)} error={form.errors.identity_card} />
                    <FileField label="Ganti Kartu Keluarga" current={student?.family_card_url} onChange={(file) => setFile('family_card', file)} error={form.errors.family_card} />
                    <Field label="Tanda Tangan Peserta" error={error('participant_signature_name')}>
                        <Input value={form.data.participant_signature_name} onChange={(e) => form.setData('participant_signature_name', e.target.value)} required />
                    </Field>
                    <Field label="Tanda Tangan Wali" error={error('guardian_signature_name')}>
                        <Input value={form.data.guardian_signature_name} onChange={(e) => form.setData('guardian_signature_name', e.target.value)} required />
                    </Field>
                </div>
            </Card>

            <Card className="space-y-5 p-5">
                <h2 className="text-lg font-bold">Pembayaran</h2>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Status Pembayaran" error={error('payment_status')}>
                        <Select value={form.data.payment_status} onChange={(value) => form.setData('payment_status', value)} options={[{ value: 'unpaid', label: 'Belum Bayar' }, { value: 'paid', label: 'Lunas' }]} />
                    </Field>
                    <Field label="Jumlah (Rp)" error={error('payment_amount')}>
                        <Input type="number" min={0} value={form.data.payment_amount} onChange={(e) => form.setData('payment_amount', e.target.value)} />
                    </Field>
                    <FileField label="Upload Bukti Bayar" current={participant.payment_proof_url} onChange={(file) => setFile('payment_proof', file)} error={form.errors.payment_proof} />
                </div>
                <Field label="Catatan Pembayaran" error={error('payment_note')}>
                    <Textarea rows={2} value={form.data.payment_note} onChange={(e) => form.setData('payment_note', e.target.value)} />
                </Field>
            </Card>
        </form>
    );
}

const Field = ({ label, children, error }: { label: string; children: ReactNode; error?: ReactNode }) => (
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

const FileField = ({
    label,
    current,
    onChange,
    error,
}: {
    label: string;
    current?: string | null;
    onChange: (file?: File | null) => void;
    error?: string;
}) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        {current && (
            <a
                href={current}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium text-primary underline"
            >
                Lihat file saat ini
            </a>
        )}
        <Input type="file" onChange={(event) => onChange(event.target.files?.[0])} />
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
);
