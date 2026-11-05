import { SelectComponent } from '@/components/partials/select-component';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import chaperones from '@/routes/admin/companies/chaperones';
import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    GraduationCap,
    Info,
    Loader2,
    MapPin,
    Phone,
    Save,
    Search,
    ShieldAlert,
    Shirt,
    UserCheck,
    Users,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

type Option = { id: number | string; name: string };
type Regency = { id: string | number; province_id?: string | number; name: string };
type District = { id: string | number; regency_id?: string | number; name: string };
type Village = { id: string | number; district_id?: string | number; name: string };

type TeacherOption = {
    id: number | string | null;
    user_id?: number | null;
    penyaluran_teacher_id?: number | string | null;
    name: string;
    nik?: string;
    phone: string;
    gender: 'male' | 'female';
    email?: string;
    birth_place?: string;
    birth_date?: string | null;
    address?: string;
    province_id?: string | number | null;
    regency_id?: string | number | null;
    district_id?: string | number | null;
    village_id?: string | number | null;
    branch?: string;
};

type ParticipantOption = {
    id: number;
    registration_number: string;
    name: string;
    school_name: string;
    grade: string;
    olimpiade_name: string;
    category: string;
    is_binaan: boolean;
    national_status: string;
    already_assigned_other?: boolean;
};

type Props = {
    initialData?: Record<string, any>;
    selectedParticipantIds?: number[];
    teachers: TeacherOption[];
    participants: ParticipantOption[];
    provinces: Option[];
    isCabang: boolean;
    defaultBranch?: string;
    isEdit?: boolean;
};

export function ChaperoneForm({
    initialData = {},
    selectedParticipantIds = [],
    teachers = [],
    participants = [],
    provinces = [],
    isCabang,
    defaultBranch = '',
    isEdit = false,
}: Props) {
    const form = useForm({
        source_type: initialData.source_type ?? 'karyawan',
        penyaluran_teacher_id: initialData.penyaluran_teacher_id ?? '',
        branch: initialData.branch ?? defaultBranch,
        kantor_id: initialData.kantor_id ?? '',
        name: initialData.name ?? '',
        nik: initialData.nik ?? '',
        gender: (initialData.gender as 'male' | 'female') ?? 'male',
        shirt_size: initialData.shirt_size ?? '',
        phone: initialData.phone ?? '',
        email: initialData.email ?? '',
        position: initialData.position ?? (initialData.source_type === 'guru' ? 'Guru Pembimbing Cabang' : 'Staf Kantor Cabang'),
        birth_place: initialData.birth_place ?? '',
        birth_date: initialData.birth_date ? String(initialData.birth_date).slice(0, 10) : '',
        address: initialData.address ?? '',
        province_id: initialData.province_id ? String(initialData.province_id) : '',
        regency_id: initialData.regency_id ? String(initialData.regency_id) : '',
        district_id: initialData.district_id ? String(initialData.district_id) : '',
        village_id: initialData.village_id ? String(initialData.village_id) : '',
        participant_ids: selectedParticipantIds.map(Number),
        notes: initialData.notes ?? '',
    });

    const [regencies, setRegencies] = useState<Regency[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);
    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);
    const [loadingTeacherDetail, setLoadingTeacherDetail] = useState(false);
    const [participantSearch, setParticipantSearch] = useState('');
    const [selectedTeacherKey, setSelectedTeacherKey] = useState<string>(() => {
        if (initialData.penyaluran_teacher_id) {
            const found = teachers.find(
                (t) =>
                    (t.penyaluran_teacher_id && String(t.penyaluran_teacher_id) === String(initialData.penyaluran_teacher_id)) ||
                    String(t.id) === String(initialData.penyaluran_teacher_id)
            );
            if (found) return String(found.id);
        }
        return '';
    });

    // Transform options for SelectComponent
    const teacherOptions = useMemo(
        () =>
            teachers.map((t) => ({
                value: String(t.id),
                label: `${t.name}${t.phone ? ` (${t.phone})` : ''}${t.branch ? ` • ${t.branch}` : ''}`,
            })),
        [teachers]
    );

    const provinceOptions = useMemo(
        () => provinces.map((p) => ({ value: String(p.id), label: p.name })),
        [provinces]
    );

    const regencyOptions = useMemo(
        () => regencies.map((r) => ({ value: String(r.id), label: r.name })),
        [regencies]
    );

    const districtOptions = useMemo(
        () => districts.map((d) => ({ value: String(d.id), label: d.name })),
        [districts]
    );

    const villageOptions = useMemo(
        () => villages.map((v) => ({ value: String(v.id), label: v.name })),
        [villages]
    );

    // Fetch initial regencies if editing or province changed
    useEffect(() => {
        const pid = form.data.province_id;
        if (!pid) {
            setRegencies((prev) => (prev.length === 0 ? prev : []));
            return;
        }

        setLoadingRegencies(true);
        fetch(`/regions/regencies?province_id=${encodeURIComponent(pid)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => setRegencies(p.data ?? []))
            .catch(() => setRegencies([]))
            .finally(() => setLoadingRegencies(false));
    }, [form.data.province_id]);

    // Fetch initial districts if editing or regency changed
    useEffect(() => {
        const rid = form.data.regency_id;
        if (!rid) {
            setDistricts((prev) => (prev.length === 0 ? prev : []));
            return;
        }

        setLoadingDistricts(true);
        fetch(`/regions/districts?regency_id=${encodeURIComponent(rid)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => setDistricts(p.data ?? []))
            .catch(() => setDistricts([]))
            .finally(() => setLoadingDistricts(false));
    }, [form.data.regency_id]);

    // Fetch initial villages if editing or district changed
    useEffect(() => {
        const did = form.data.district_id;
        if (!did) {
            setVillages((prev) => (prev.length === 0 ? prev : []));
            return;
        }

        setLoadingVillages(true);
        fetch(`/regions/villages?district_id=${encodeURIComponent(did)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((p) => setVillages(p.data ?? []))
            .catch(() => setVillages([]))
            .finally(() => setLoadingVillages(false));
    }, [form.data.district_id]);

    // Handle teacher selection auto-fill
    const handleTeacherSelect = async (teacherIdStr: string) => {
        setSelectedTeacherKey(teacherIdStr);

        if (!teacherIdStr) {
            form.setData('penyaluran_teacher_id', '');
            return;
        }

        const teacher = teachers.find((t) => String(t.id) === teacherIdStr);
        if (!teacher) return;

        const effectivePenyaluranId = teacher.penyaluran_teacher_id
            ? String(teacher.penyaluran_teacher_id)
            : (teacher.id ? String(teacher.id) : '');

        // 1. Instantly set initial data from local teacher array
        form.setData((prev) => ({
            ...prev,
            penyaluran_teacher_id: effectivePenyaluranId,
            name: teacher.name || prev.name,
            nik: teacher.nik || prev.nik,
            phone: teacher.phone || prev.phone,
            gender: teacher.gender || prev.gender,
            email: teacher.email || prev.email,
            address: teacher.address || prev.address,
            province_id: teacher.province_id ? String(teacher.province_id) : prev.province_id,
            regency_id: teacher.regency_id ? String(teacher.regency_id) : prev.regency_id,
            district_id: teacher.district_id ? String(teacher.district_id) : prev.district_id,
            village_id: teacher.village_id ? String(teacher.village_id) : prev.village_id,
            position: 'Guru Pembimbing Cabang',
        }));

        // 2. Fetch fresh detailed data from Penyaluran API via backend endpoint
        // to guarantee NIK and full address/wilayah are populated even if the list endpoint omitted them
        try {
            setLoadingTeacherDetail(true);
            const res = await fetch(`/admin/companies/chaperones/teacher-detail/${encodeURIComponent(teacherIdStr)}`, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                    const detail = json.data;
                    form.setData((prev) => ({
                        ...prev,
                        penyaluran_teacher_id: detail.penyaluran_teacher_id
                            ? String(detail.penyaluran_teacher_id)
                            : (detail.id ? String(detail.id) : prev.penyaluran_teacher_id),
                        name: detail.name || prev.name,
                        nik: detail.nik || prev.nik,
                        phone: detail.phone || prev.phone,
                        gender: detail.gender || prev.gender,
                        email: detail.email || prev.email,
                        address: detail.address || prev.address,
                        birth_place: detail.birth_place || prev.birth_place,
                        birth_date: detail.birth_date ? String(detail.birth_date).slice(0, 10) : prev.birth_date,
                        province_id: detail.province_id ? String(detail.province_id) : prev.province_id,
                        regency_id: detail.regency_id ? String(detail.regency_id) : prev.regency_id,
                        district_id: detail.district_id ? String(detail.district_id) : prev.district_id,
                        village_id: detail.village_id ? String(detail.village_id) : prev.village_id,
                        position: 'Guru Pembimbing Cabang',
                    }));
                }
            }
        } catch (e) {
            console.error('Gagal mengambil detail profil guru:', e);
        } finally {
            setLoadingTeacherDetail(false);
        }
    };

    // Filter participants by search query
    const filteredParticipants = useMemo(() => {
        if (!participantSearch.trim()) return participants;
        const q = participantSearch.toLowerCase();
        return participants.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.registration_number.toLowerCase().includes(q) ||
                p.school_name.toLowerCase().includes(q) ||
                p.olimpiade_name.toLowerCase().includes(q)
        );
    }, [participants, participantSearch]);

    // Toggle participant selection (strictly idempotent, safe against re-render loops & Radix bubble events)
    const handleToggleParticipant = (id: number, nextChecked?: boolean) => {
        form.setData((prev: any) => {
            const current: number[] = Array.isArray(prev?.participant_ids)
                ? prev.participant_ids
                : [];
            const exists = current.includes(id);
            const shouldBeChecked = nextChecked !== undefined ? nextChecked : !exists;

            if (shouldBeChecked === exists) {
                return prev;
            }

            const nextParticipantIds = shouldBeChecked
                ? [...current, id]
                : current.filter((item: number) => item !== id);

            return {
                ...prev,
                participant_ids: nextParticipantIds,
            };
        });
    };

    // Select / deselect all
    const selectAllParticipants = () => {
        const allIds = participants.map((p) => p.id);
        form.setData((prev: any) => ({
            ...prev,
            participant_ids: allIds,
        }));
    };

    const deselectAllParticipants = () => {
        form.setData((prev: any) => ({
            ...prev,
            participant_ids: [],
        }));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!form.data.shirt_size) {
            form.setError('shirt_size', 'Silakan pilih ukuran kaos / baju pendamping terlebih dahulu.');
            return;
        }
        form.clearErrors('shirt_size');

        if (isEdit && initialData.id) {
            form.put(chaperones.update(initialData.id).url);
        } else {
            form.post(chaperones.store().url);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Header / Action bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={chaperones.index().url}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                            {isEdit ? 'Ubah Data Pendamping Nasional' : 'Daftarkan Pendamping Babak Nasional'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isCabang
                                ? `Pendaftaran Official Penanggung Jawab Kontingen Cabang ${defaultBranch}`
                                : 'Pendaftaran dan Penugasan Official Pendamping Babak Final Nasional'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={chaperones.index().url}>Batal</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="bg-[#17524A] text-white hover:bg-[#13443d]"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {form.processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Pendamping'}
                    </Button>
                </div>
            </div>

            {/* CARD 1: Sumber Data & Asal Pendamping */}
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                        <Building2 className="h-4 w-4 text-[#17524A]" />
                        1. Asal & Sumber Data Pendamping
                    </CardTitle>
                    <CardDescription>
                        Pilih apakah pendamping berasal dari Guru binaan cabang atau Karyawan/Official internal cabang.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-foreground">Sumber Calon Pendamping</Label>
                        <RadioGroup
                            value={form.data.source_type}
                            onValueChange={(val: 'guru' | 'karyawan' | 'lainnya') => {
                                form.setData('source_type', val);
                                if (val === 'karyawan') {
                                    form.setData('position', 'Staf Kantor Cabang');
                                    form.setData('penyaluran_teacher_id', '');
                                    setSelectedTeacherKey('');
                                } else if (val === 'guru') {
                                    form.setData('position', 'Guru Pembimbing Cabang');
                                }
                            }}
                            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                        >
                            <label
                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                                    form.data.source_type === 'guru'
                                        ? 'border-[#17524A] bg-[#17524A]/5 ring-1 ring-[#17524A]'
                                        : 'border-border hover:bg-muted/40'
                                }`}
                            >
                                <RadioGroupItem value="guru" id="source-guru" className="mt-1" />
                                <div>
                                    <div className="font-medium text-sm text-foreground flex items-center gap-1.5">
                                        <GraduationCap className="h-4 w-4 text-[#17524A]" />
                                        Ambil dari Data Guru Cabang
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Pilih dari guru sanggar terdaftar satu cabang. Biodata akan terisi otomatis.
                                    </p>
                                </div>
                            </label>

                            <label
                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                                    form.data.source_type === 'karyawan'
                                        ? 'border-[#17524A] bg-[#17524A]/5 ring-1 ring-[#17524A]'
                                        : 'border-border hover:bg-muted/40'
                                }`}
                            >
                                <RadioGroupItem value="karyawan" id="source-karyawan" className="mt-1" />
                                <div>
                                    <div className="font-medium text-sm text-foreground flex items-center gap-1.5">
                                        <Users className="h-4 w-4 text-[#17524A]" />
                                        Input Manual (Karyawan / Official Cabang)
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Isi formulir biodata mandiri untuk staf program, kepala cabang, atau tokoh pendamping.
                                    </p>
                                </div>
                            </label>
                        </RadioGroup>
                    </div>

                    {!isCabang && (
                        <div className="space-y-1.5 pt-1">
                            <Label htmlFor="branch" className="text-xs font-semibold">
                                Nama Kantor Cabang <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="branch"
                                value={form.data.branch}
                                onChange={(e) => form.setData('branch', e.target.value.toUpperCase())}
                                placeholder="Contoh: SURABAYA / MALANG / JAKARTA"
                                required
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Tentukan nama kantor cabang yang menugaskan official pendamping ini.
                            </p>
                        </div>
                    )}

                    {isCabang && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <Building2 className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                            <span>
                                Terdaftar untuk penugasan kontingen cabang: <strong>{defaultBranch || 'Cabang Terdaftar'}</strong>
                            </span>
                        </div>
                    )}

                    {form.data.source_type === 'guru' && (
                        <div className="rounded-lg border border-[#17524A]/30 bg-[#17524A]/5 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <UserCheck className="h-3.5 w-3.5 text-[#17524A]" />
                                    Cari &amp; Pilih Guru Pembimbing Cabang
                                </Label>
                                {loadingTeacherDetail && (
                                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 animate-pulse">
                                        <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                                        Sinkronisasi NIK &amp; profil dari Penyaluran...
                                    </span>
                                )}
                            </div>
                            {teachers.length === 0 ? (
                                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                                    Belum ada data guru terdeteksi di cabang ini. Anda tetap dapat memilih opsi Input Manual di atas.
                                </p>
                            ) : (
                                <SelectComponent
                                    placeholder="Ketik untuk mencari nama guru, nomor WhatsApp, atau sanggar..."
                                    data={teacherOptions}
                                    dataSelected={selectedTeacherKey}
                                    handleOnChange={(val: string) => handleTeacherSelect(val)}
                                />
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                Ketik nama guru untuk memfilter cepat. Memilih guru akan mengisi otomatis data nama, NIK, kontak, jenis kelamin, dan domisili di bawah.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* CARD 2: Biodata Diri Pendamping */}
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                        <UserCheck className="h-4 w-4 text-[#17524A]" />
                        2. Biodata Diri Pendamping
                    </CardTitle>
                    <CardDescription>
                        Data resmi penanggung jawab rombongan peserta. Pastikan nomor kontak dan WhatsApp aktif.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                Nama Lengkap & Gelar <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Contoh: Muhammad Ilham, S.Pd."
                                className={form.errors.name ? 'border-destructive' : ''}
                            />
                            {form.errors.name && (
                                <p className="text-xs text-destructive">{form.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="nik" className="text-xs font-semibold">
                                    NIK (16 Digit) <span className="text-destructive">*</span>
                                </Label>
                                {loadingTeacherDetail && (
                                    <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium animate-pulse">
                                        <Loader2 className="h-2.5 w-2.5 animate-spin" /> Mengambil NIK...
                                    </span>
                                )}
                            </div>
                            <Input
                                id="nik"
                                maxLength={16}
                                value={form.data.nik}
                                onChange={(e) => form.setData('nik', e.target.value.replace(/\D/g, ''))}
                                placeholder="351508xxxxxxxxxx"
                                className={form.errors.nik ? 'border-destructive' : ''}
                            />
                            {form.errors.nik && (
                                <p className="text-xs text-destructive">{form.errors.nik}</p>
                            )}
                        </div>

                        {/* Jenis Kelamin - full width matching Inputs */}
                        <div className="space-y-1.5">
                            <Label htmlFor="gender" className="text-xs font-semibold">
                                Jenis Kelamin <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={form.data.gender || 'male'}
                                onValueChange={(val: 'male' | 'female') => form.setData('gender', val)}
                            >
                                <SelectTrigger
                                    id="gender"
                                    className={`w-full h-9 bg-background ${form.errors.gender ? 'border-destructive' : ''}`}
                                >
                                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Laki-laki (L)</SelectItem>
                                    <SelectItem value="female">Perempuan (P)</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.gender && (
                                <p className="text-xs text-destructive">{form.errors.gender}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1">
                                <Phone className="h-3 w-3 text-emerald-600" />
                                No. WhatsApp / HP Aktif <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="phone"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className={form.errors.phone ? 'border-destructive' : ''}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Digunakan untuk koordinasi darurat dan grup panitia Babak Final Nasional.
                            </p>
                            {form.errors.phone && (
                                <p className="text-xs text-destructive">{form.errors.phone}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold">
                                Alamat Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                placeholder="email@contoh.com"
                                className={form.errors.email ? 'border-destructive' : ''}
                            />
                            {form.errors.email && (
                                <p className="text-xs text-destructive">{form.errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="position" className="text-xs font-semibold">
                                Jabatan / Instansi Penugasan
                            </Label>
                            <Input
                                id="position"
                                value={form.data.position}
                                onChange={(e) => form.setData('position', e.target.value)}
                                placeholder="Contoh: Staf Program Cabang / Guru Sanggar"
                                className={form.errors.position ? 'border-destructive' : ''}
                            />
                            {form.errors.position && (
                                <p className="text-xs text-destructive">{form.errors.position}</p>
                            )}
                        </div>

                        {/* Ukuran Kaos / Baju Pendamping */}
                        <div className="space-y-1.5">
                            <Label htmlFor="shirt_size" className="text-xs font-semibold flex items-center gap-1.5">
                                <Shirt className="h-3.5 w-3.5 text-emerald-600" />
                                Ukuran Kaos / Baju Pendamping <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={form.data.shirt_size}
                                onValueChange={(val: string) => {
                                    form.setData('shirt_size', val);
                                    if (form.errors.shirt_size) form.clearErrors('shirt_size');
                                }}
                            >
                                <SelectTrigger
                                    id="shirt_size"
                                    className={`w-full h-9 bg-background ${form.errors.shirt_size ? 'border-destructive' : ''}`}
                                >
                                    <SelectValue placeholder="Pilih Ukuran Kaos / Baju" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="XS">XS (Extra Small)</SelectItem>
                                    <SelectItem value="S">S (Small)</SelectItem>
                                    <SelectItem value="M">M (Medium)</SelectItem>
                                    <SelectItem value="L">L (Large)</SelectItem>
                                    <SelectItem value="XL">XL (Extra Large)</SelectItem>
                                    <SelectItem value="XXL">XXL (Double Extra Large)</SelectItem>
                                    <SelectItem value="XXXL">XXXL (3XL)</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.shirt_size && (
                                <p className="text-xs text-destructive">{form.errors.shirt_size}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="birth_place" className="text-xs font-semibold">
                                Tempat Lahir
                            </Label>
                            <Input
                                id="birth_place"
                                value={form.data.birth_place}
                                onChange={(e) => form.setData('birth_place', e.target.value)}
                                placeholder="Kota kelahiran"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="birth_date" className="text-xs font-semibold">
                                Tanggal Lahir
                            </Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={form.data.birth_date}
                                onChange={(e) => form.setData('birth_date', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CARD 3: Alamat & Wilayah Domisili (Responsive 2-column Grid with Searchable SelectComponent) */}
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                        <MapPin className="h-4 w-4 text-[#17524A]" />
                        3. Alamat & Wilayah Domisili
                    </CardTitle>
                    <CardDescription>
                        Alamat domisili pendamping untuk koordinasi akomodasi dan penjemputan kontingen.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="address" className="text-xs font-semibold">
                            Alamat Lengkap
                        </Label>
                        <Textarea
                            id="address"
                            rows={3}
                            value={form.data.address}
                            onChange={(e) => form.setData('address', e.target.value)}
                            placeholder="Jl. Nama Jalan No. XX, RT/RW, Dusun/Kompleks..."
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Provinsi */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Provinsi</Label>
                            <SelectComponent
                                placeholder="Pilih / Cari Provinsi..."
                                data={provinceOptions}
                                dataSelected={form.data.province_id ? String(form.data.province_id) : ''}
                                handleOnChange={(val: string) => {
                                    form.setData({
                                        ...form.data,
                                        province_id: val ? String(val) : '',
                                        regency_id: '',
                                        district_id: '',
                                        village_id: '',
                                    });
                                    setDistricts([]);
                                    setVillages([]);
                                }}
                                color={form.errors.province_id ? 'danger' : 'default'}
                            />
                            {form.errors.province_id && (
                                <p className="text-xs text-destructive">{form.errors.province_id}</p>
                            )}
                        </div>

                        {/* Kabupaten / Kota */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Kabupaten / Kota{' '}
                                {loadingRegencies && (
                                    <span className="text-[10px] text-muted-foreground animate-pulse">
                                        (memuat data...)
                                    </span>
                                )}
                            </Label>
                            <SelectComponent
                                placeholder={
                                    loadingRegencies
                                        ? 'Memuat data kota...'
                                        : form.data.province_id
                                          ? 'Pilih / Cari Kota/Kabupaten...'
                                          : 'Pilih provinsi terlebih dahulu'
                                }
                                data={regencyOptions}
                                dataSelected={form.data.regency_id ? String(form.data.regency_id) : ''}
                                handleOnChange={(val: string) => {
                                    form.setData({
                                        ...form.data,
                                        regency_id: val ? String(val) : '',
                                        district_id: '',
                                        village_id: '',
                                    });
                                    setVillages([]);
                                }}
                                disabled={!form.data.province_id || loadingRegencies}
                                color={form.errors.regency_id ? 'danger' : 'default'}
                            />
                            {form.errors.regency_id && (
                                <p className="text-xs text-destructive">{form.errors.regency_id}</p>
                            )}
                        </div>

                        {/* Kecamatan */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Kecamatan{' '}
                                {loadingDistricts && (
                                    <span className="text-[10px] text-muted-foreground animate-pulse">
                                        (memuat data...)
                                    </span>
                                )}
                            </Label>
                            <SelectComponent
                                placeholder={
                                    loadingDistricts
                                        ? 'Memuat data kecamatan...'
                                        : form.data.regency_id
                                          ? 'Pilih / Cari Kecamatan...'
                                          : 'Pilih kabupaten/kota terlebih dahulu'
                                }
                                data={districtOptions}
                                dataSelected={form.data.district_id ? String(form.data.district_id) : ''}
                                handleOnChange={(val: string) => {
                                    form.setData({
                                        ...form.data,
                                        district_id: val ? String(val) : '',
                                        village_id: '',
                                    });
                                }}
                                disabled={!form.data.regency_id || loadingDistricts}
                                color={form.errors.district_id ? 'danger' : 'default'}
                            />
                            {form.errors.district_id && (
                                <p className="text-xs text-destructive">{form.errors.district_id}</p>
                            )}
                        </div>

                        {/* Kelurahan / Desa */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Kelurahan / Desa{' '}
                                {loadingVillages && (
                                    <span className="text-[10px] text-muted-foreground animate-pulse">
                                        (memuat data...)
                                    </span>
                                )}
                            </Label>
                            <SelectComponent
                                placeholder={
                                    loadingVillages
                                        ? 'Memuat data desa...'
                                        : form.data.district_id
                                          ? 'Pilih / Cari Kelurahan/Desa...'
                                          : 'Pilih kecamatan terlebih dahulu'
                                }
                                data={villageOptions}
                                dataSelected={form.data.village_id ? String(form.data.village_id) : ''}
                                handleOnChange={(val: string) =>
                                    form.setData('village_id', val ? String(val) : '')
                                }
                                disabled={!form.data.district_id || loadingVillages}
                                color={form.errors.village_id ? 'danger' : 'default'}
                            />
                            {form.errors.village_id && (
                                <p className="text-xs text-destructive">{form.errors.village_id}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CARD 4: Penugasan Peserta Babak Final Nasional */}
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                                <Users className="h-4 w-4 text-[#17524A]" />
                                4. Penugasan Peserta yang Didampingi
                            </CardTitle>
                            <CardDescription>
                                Pilih peserta babak nasional dari perwakilan cabang ini yang menjadi tanggung jawab pendamping.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-[#17524A]/10 px-3 py-1 text-xs font-medium text-[#17524A]">
                                {form.data.participant_ids.length} Peserta Terpilih
                            </span>
                            {participants.length > 0 && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={selectAllParticipants}
                                    >
                                        Pilih Semua
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={deselectAllParticipants}
                                    >
                                        Batal Semua
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    {/* Mini search bar */}
                    {participants.length > 5 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama peserta, nomor registrasi, atau asal sekolah..."
                                value={participantSearch}
                                onChange={(e) => setParticipantSearch(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                    )}

                    {participants.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
                            <Info className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                            <p className="text-sm font-medium">Belum Ada Peserta Babak Nasional dari Cabang Ini</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Peserta akan muncul setelah ditetapkan lolos ke babak nasional oleh Admin Pusat. Anda tetap dapat menyimpan data pendamping ini terlebih dahulu.
                            </p>
                        </div>
                    ) : filteredParticipants.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                            Tidak ada peserta yang cocok dengan kata kunci &quot;{participantSearch}&quot;.
                        </p>
                    ) : (
                        <div className="max-h-[380px] overflow-y-auto space-y-2 rounded-lg border p-2">
                            {filteredParticipants.map((p) => {
                                const isChecked = Array.isArray(form.data.participant_ids) && form.data.participant_ids.includes(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        onClick={(e) => {
                                            // Ignore clicks from buttons/inputs/links to avoid double-dispatch
                                            // and Radix CheckboxBubbleInput synthetic click loops
                                            const target = e.target as HTMLElement;
                                            if (target.closest('button, input, a')) {
                                                return;
                                            }
                                            handleToggleParticipant(p.id, !isChecked);
                                        }}
                                        className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors ${
                                            isChecked
                                                ? 'border-[#17524A] bg-[#17524A]/5'
                                                : 'border-border/60 hover:bg-muted/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id={`participant-${p.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(val) => handleToggleParticipant(p.id, Boolean(val))}
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {p.name}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-muted-foreground">
                                                        ({p.registration_number})
                                                    </span>
                                                    <span
                                                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                            p.is_binaan
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {p.is_binaan ? 'Santri Binaan' : 'Umum'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {p.school_name} {p.grade ? `• Kelas ${p.grade}` : ''} • {p.olimpiade_name} ({p.category})
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {p.already_assigned_other && !isChecked && (
                                                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                    Didampingi Official Lain
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" asChild>
                    <Link href={chaperones.index().url}>Batal</Link>
                </Button>
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="bg-[#17524A] text-white hover:bg-[#13443d]"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {form.processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Pendamping'}
                </Button>
            </div>
        </form>
    );
}
