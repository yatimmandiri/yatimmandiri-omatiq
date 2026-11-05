import { ProofModal } from '@/components/ui/proof-modal';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { confirmAction } from '@/utils/sweetalert';
import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Building2,
    Image as ImageIcon,
    Info,
    Loader2,
    Save,
    Shield,
    Shirt,
    Upload,
    User,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

type UserOption = {
    id: number;
    name: string;
    email: string;
};

type CommitteeFormProps = {
    committee?: any;
    photoUrl?: string | null;
    users?: UserOption[];
    suggestedCode?: string;
};

const COMMON_DIVISIONS = [
    'Acara & Lomba',
    'Perlengkapan & Logistik',
    'Konsumsi',
    'Kesehatan & Medis',
    'Keamanan & Ketertiban',
    'Dewan Juri Nasional',
    'IT, Multimedia & Streaming',
    'Humas, Publikasi & Dokumentasi',
    'Sekretariat & Registrasi',
    'Transportasi & Akomodasi',
];

const ACCESS_ZONES = [
    'All Access',
    'Main Stage & Arena',
    'Backstage & VIP Room',
    'Registration Gate Only',
    'General Access',
];

const SHIRT_SIZES = [
    { value: 'XS', label: 'XS (Extra Small)' },
    { value: 'S', label: 'S (Small)' },
    { value: 'M', label: 'M (Medium)' },
    { value: 'L', label: 'L (Large)' },
    { value: 'XL', label: 'XL (Extra Large)' },
    { value: 'XXL', label: 'XXL (Double Extra Large)' },
    { value: 'XXXL', label: 'XXXL (3XL)' },
];

export function CommitteeForm({
    committee,
    photoUrl,
    users = [],
    suggestedCode,
}: CommitteeFormProps) {
    const isEdit = !!committee;

    const { data, setData, post, put, processing, errors, setError, clearErrors, reset } = useForm({
        name: committee?.name ?? '',
        branch: committee?.branch ?? '',
        nik: committee?.nik ?? '',
        gender: committee?.gender ?? 'male',
        phone: committee?.phone ?? '',
        email: committee?.email ?? '',
        shirt_size: committee?.shirt_size ?? '',
        division: committee?.division ?? 'Acara & Lomba',
        position: committee?.position ?? 'Anggota Panitia',
        access_zone: committee?.access_zone ?? 'All Access',
        user_id: committee?.user_id ? String(committee.user_id) : '',
        status: committee?.status ?? 'active',
        notes: committee?.notes ?? '',
        photo: null as File | null,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(photoUrl ?? null);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setData('photo', null);
        setPhotoPreview(null);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!data.shirt_size) {
            setError('shirt_size', 'Silakan pilih ukuran kaos / baju panitia terlebih dahulu.');
            return;
        }
        clearErrors('shirt_size');

        if (isEdit) {
            router.post(`/admin/companies/committees/${committee.id}`, {
                ...data,
                _method: 'PUT',
            }, {
                forceFormData: true,
            });
        } else {
            post('/admin/companies/committees');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <BadgeCheck className="h-6 w-6 text-amber-500" />
                        {isEdit ? `Edit Data Panitia: ${committee.name}` : 'Tambah Panitia Pelaksana Baru'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Kelola data panitia nasional, hak akses venue, dan pencetakan lanyard pass resmi OMATIQ 2026.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild size="sm">
                        <Link href="/admin/companies/committees">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Suggested Code Notice */}
            {!isEdit && suggestedCode && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <BadgeCheck className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>Kode otomatis yang akan digenerate sistem:</span>
                    </div>
                    <span className="font-mono font-bold text-sm bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-800">
                        {suggestedCode}
                    </span>
                </div>
            )}

            {/* Identitas Panitia Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        Identitas & Kontak Panitia
                    </CardTitle>
                    <CardDescription>
                        Informasi data diri panitia. Foto bersifat opsional dan dapat diunggah kemudian.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                Nama Lengkap Panitia <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Muhammad Ihsan, S.Kom."
                                className={errors.name ? 'border-rose-500' : ''}
                            />
                            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                        </div>

                        {/* Branch / Kantor Cabang */}
                        <div className="space-y-1.5">
                            <Label htmlFor="branch" className="text-xs font-semibold flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-amber-600" />
                                Kantor Cabang / Penugasan <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="branch"
                                value={data.branch}
                                onChange={(e) => setData('branch', e.target.value)}
                                placeholder="Contoh: Pusat 1 / Regional / SURABAYA"
                                className={errors.branch ? 'border-rose-500' : ''}
                            />
                            {errors.branch && <p className="text-xs text-rose-500">{errors.branch}</p>}
                        </div>

                        {/* NIK */}
                        <div className="space-y-1.5">
                            <Label htmlFor="nik" className="text-xs font-semibold">
                                NIK <span className="text-slate-400 font-normal">(Opsional - 16 digit)</span>
                            </Label>
                            <Input
                                id="nik"
                                value={data.nik}
                                onChange={(e) => setData('nik', e.target.value.replace(/[^0-9]/g, '').slice(0, 16))}
                                placeholder="3578..."
                                maxLength={16}
                                className={errors.nik ? 'border-rose-500' : ''}
                            />
                            {errors.nik && <p className="text-xs text-rose-500">{errors.nik}</p>}
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Jenis Kelamin <span className="text-rose-500">*</span>
                            </Label>
                            <RadioGroup
                                value={data.gender}
                                onValueChange={(val: any) => setData('gender', val)}
                                className="flex items-center gap-6 pt-1.5"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="gender-male" />
                                    <Label htmlFor="gender-male" className="text-xs font-medium cursor-pointer">
                                        Laki-laki
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="gender-female" />
                                    <Label htmlFor="gender-female" className="text-xs font-medium cursor-pointer">
                                        Perempuan
                                    </Label>
                                </div>
                            </RadioGroup>
                            {errors.gender && <p className="text-xs text-rose-500">{errors.gender}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold">
                                No. WhatsApp / Telepon <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="Contoh: 08123456789"
                                className={errors.phone ? 'border-rose-500' : ''}
                            />
                            {errors.phone && <p className="text-xs text-rose-500">{errors.phone}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold">
                                Alamat Email <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="panitia@yatimmandiri.org"
                                className={errors.email ? 'border-rose-500' : ''}
                            />
                            {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                        </div>

                        {/* Ukuran Kaos / Baju Panitia */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="shirt_size" className="text-xs font-semibold flex items-center gap-1.5">
                                <Shirt className="h-3.5 w-3.5 text-emerald-600" />
                                Ukuran Kaos / Baju Panitia <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={data.shirt_size}
                                onValueChange={(val) => {
                                    setData('shirt_size', val);
                                    if (errors.shirt_size) clearErrors('shirt_size');
                                }}
                            >
                                <SelectTrigger id="shirt_size" className={errors.shirt_size ? 'border-rose-500' : ''}>
                                    <SelectValue placeholder="Pilih ukuran baju panitia" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SHIRT_SIZES.map((size) => (
                                        <SelectItem key={size.value} value={size.value}>
                                            {size.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">
                                Digunakan panitia pusat untuk penyediaan seragam resmi Babak Final Nasional OMATIQ 2026.
                            </p>
                            {errors.shirt_size && <p className="text-xs text-rose-500">{errors.shirt_size}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Divisi & Hak Akses Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-500" />
                        Divisi, Posisi & Hak Akses Venue
                    </CardTitle>
                    <CardDescription>
                        Menentukan teks pada badge lanyard dan zona izin akses di lokasi lomba.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Division */}
                        <div className="space-y-1.5">
                            <Label htmlFor="division" className="text-xs font-semibold">
                                Divisi Kepanitiaan <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={data.division}
                                onValueChange={(val) => setData('division', val)}
                            >
                                <SelectTrigger id="division">
                                    <SelectValue placeholder="Pilih Divisi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMMON_DIVISIONS.map((div) => (
                                        <SelectItem key={div} value={div}>
                                            {div}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.division && <p className="text-xs text-rose-500">{errors.division}</p>}
                        </div>

                        {/* Position / Jabatan */}
                        <div className="space-y-1.5">
                            <Label htmlFor="position" className="text-xs font-semibold">
                                Jabatan / Peran <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="position"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                placeholder="Contoh: Koordinator Perlengkapan / Juri"
                                className={errors.position ? 'border-rose-500' : ''}
                            />
                            {errors.position && <p className="text-xs text-rose-500">{errors.position}</p>}
                        </div>

                        {/* Access Zone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="access_zone" className="text-xs font-semibold">
                                Zona Akses Venue <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={data.access_zone}
                                onValueChange={(val) => setData('access_zone', val)}
                            >
                                <SelectTrigger id="access_zone">
                                    <SelectValue placeholder="Pilih Zona Akses" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACCESS_ZONES.map((zone) => (
                                        <SelectItem key={zone} value={zone}>
                                            {zone}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.access_zone && <p className="text-xs text-rose-500">{errors.access_zone}</p>}
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label htmlFor="status" className="text-xs font-semibold">
                                Status Keaktifan <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={data.status}
                                onValueChange={(val) => setData('status', val)}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktif (Resmi Bertugas)</SelectItem>
                                    <SelectItem value="inactive">Non-Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-rose-500">{errors.status}</p>}
                        </div>

                        {/* Linked User Account (Opsional) */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="user_id" className="text-xs font-semibold flex items-center justify-between">
                                <span>Tautkan ke Akun Dashboard Admin <span className="text-slate-400 font-normal">(Opsional)</span></span>
                                <span className="text-[11px] text-slate-500">Khusus panitia yang memiliki akses login dashboard</span>
                            </Label>
                            <Select
                                value={data.user_id}
                                onValueChange={(val) => setData('user_id', val === 'none' ? '' : val)}
                            >
                                <SelectTrigger id="user_id">
                                    <SelectValue placeholder="Pilih akun administrator (jika ada)..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- Tanpa Akun Dashboard (Panitia Lapangan) --</SelectItem>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name} ({u.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.user_id && <p className="text-xs text-rose-500">{errors.user_id}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Foto Panitia (Opsional) Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                        Foto Panitia <span className="text-xs font-normal text-slate-500">(Opsional)</span>
                    </CardTitle>
                    <CardDescription>
                        Unggah pas foto formal 3x4 jika ingin dicetak langsung pada lanyard pass. Jika tidak diunggah, kartu cetak tetap dapat digunakan dengan menempelkan foto manual atau avatar resmi.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Preview Box */}
                        <div className="relative h-36 w-28 shrink-0 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center overflow-hidden">
                            {photoPreview ? (
                                <>
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/80 p-1 text-white hover:bg-rose-600 transition"
                                        title="Hapus foto"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-3 text-slate-400">
                                    <User className="h-10 w-10 mx-auto stroke-[1.5]" />
                                    <span className="text-[10px] mt-1 block font-medium">Foto Kosong</span>
                                </div>
                            )}
                        </div>

                        {/* File Uploader */}
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="photo" className="text-xs font-semibold block">
                                Pilih Berkas Foto (JPG, PNG, WebP &bull; Maks. 2MB)
                            </Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={handlePhotoChange}
                                className="file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                            />
                            {photoPreview && (
                                <div className="pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsProofModalOpen(true)}
                                        className="text-xs"
                                    >
                                        <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                                        Lihat Pembesar Foto
                                    </Button>
                                    <ProofModal
                                        href={photoPreview}
                                        open={isProofModalOpen}
                                        onOpenChange={setIsProofModalOpen}
                                        title={`Foto Panitia: ${data.name || 'Pratinjau'}`}
                                    />
                                </div>
                            )}
                            {errors.photo && <p className="text-xs text-rose-500">{errors.photo}</p>}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5 pt-2">
                        <Label htmlFor="notes" className="text-xs font-semibold">
                            Catatan Tambahan Panitia <span className="text-slate-400 font-normal">(Opsional)</span>
                        </Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Keterangan tugas khusus, shift kerja, atau catatan perlengkapan..."
                            rows={3}
                        />
                        {errors.notes && <p className="text-xs text-rose-500">{errors.notes}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" type="button" asChild>
                    <Link href="/admin/companies/committees">
                        Batal
                    </Link>
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEdit ? 'Perbarui Data Panitia' : 'Simpan Panitia Baru'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
