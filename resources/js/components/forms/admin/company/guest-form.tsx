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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Crown,
    Image as ImageIcon,
    Loader2,
    MapPin,
    Save,
    Sparkles,
    User,
    Users,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

type GuestFormProps = {
    guest?: any;
    photoUrl?: string | null;
    suggestedCode?: string;
};

const GUEST_CATEGORIES = [
    { value: 'vvip', label: 'VVIP (Pejabat Tinggi & Tokoh Nasional)' },
    { value: 'vip', label: 'VIP (Kepala Dinas, Pimpinan Mitra & Tokoh Daerah)' },
    { value: 'tokoh', label: 'Tokoh Masyarakat / Ulama' },
    { value: 'sponsor', label: 'Sponsor & Donatur Utama' },
    { value: 'umum', label: 'Undangan Khusus / Umum' },
];

export function GuestForm({
    guest,
    photoUrl,
    suggestedCode,
}: GuestFormProps) {
    const isEdit = !!guest;

    const { data, setData, post, processing, errors } = useForm({
        name: guest?.name ?? '',
        institution: guest?.institution ?? '',
        position: guest?.position ?? '',
        category: guest?.category ?? 'vip',
        phone: guest?.phone ?? '',
        email: guest?.email ?? '',
        table_number: guest?.table_number ?? '',
        seat_count: guest?.seat_count ? String(guest.seat_count) : '1',
        status: guest?.status ?? 'confirmed',
        notes: guest?.notes ?? '',
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

        if (isEdit) {
            router.post(`/admin/companies/guests/${guest.id}`, {
                ...data,
                _method: 'PUT',
            }, {
                forceFormData: true,
            });
        } else {
            post('/admin/companies/guests');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Crown className="h-6 w-6 text-amber-500" />
                        {isEdit ? `Edit Data Tamu: ${guest.name}` : 'Tambah Tamu Undangan Baru'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Kelola data tamu kehormatan, alokasi meja/kursi VIP, dan lanyard pass resmi babak final OMATIQ 2026.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild size="sm">
                        <Link href="/admin/companies/guests">
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
                        <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>Nomor Undangan yang akan digenerate otomatis:</span>
                    </div>
                    <span className="font-mono font-bold text-sm bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-800">
                        {suggestedCode}
                    </span>
                </div>
            )}

            {/* Profil Tamu Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-amber-600" />
                        Identitas Tamu Kehormatan
                    </CardTitle>
                    <CardDescription>
                        Informasi nama lengkap, gelar kehormatan, instansi, dan kategori undangan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                Nama Lengkap & Gelar Tamu <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Drs. H. Bambang Soeprapto, M.Si."
                                className={errors.name ? 'border-rose-500' : ''}
                            />
                            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label htmlFor="category" className="text-xs font-semibold">
                                Kategori Tamu <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={data.category}
                                onValueChange={(val) => setData('category', val)}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {GUEST_CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-xs text-rose-500">{errors.category}</p>}
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label htmlFor="status" className="text-xs font-semibold">
                                Status Kehadiran / RSVP <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={data.status}
                                onValueChange={(val) => setData('status', val)}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="confirmed">Terkonfirmasi Hadir (Confirmed)</SelectItem>
                                    <SelectItem value="attended">Sudah Masuk Venue (Attended)</SelectItem>
                                    <SelectItem value="invited">Terkirim Undangan (Invited)</SelectItem>
                                    <SelectItem value="declined">Berhalangan Hadir (Declined)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-rose-500">{errors.status}</p>}
                        </div>

                        {/* Institution */}
                        <div className="space-y-1.5">
                            <Label htmlFor="institution" className="text-xs font-semibold">
                                Asal Lembaga / Instansi / Perusahaan <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="institution"
                                value={data.institution}
                                onChange={(e) => setData('institution', e.target.value)}
                                placeholder="Contoh: Dinas Pendidikan Provinsi Jawa Timur"
                                className={errors.institution ? 'border-rose-500' : ''}
                            />
                            {errors.institution && <p className="text-xs text-rose-500">{errors.institution}</p>}
                        </div>

                        {/* Position */}
                        <div className="space-y-1.5">
                            <Label htmlFor="position" className="text-xs font-semibold">
                                Jabatan Resmi <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="position"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                placeholder="Contoh: Kepala Dinas / Direktur Utama"
                                className={errors.position ? 'border-rose-500' : ''}
                            />
                            {errors.position && <p className="text-xs text-rose-500">{errors.position}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tempat Duduk & Kontak Protokoler Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        Alokasi Tempat Duduk & Kontak
                    </CardTitle>
                    <CardDescription>
                        Pengaturan meja VIP serta kontak penghubung/protokoler tamu.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Table Number */}
                        <div className="space-y-1.5">
                            <Label htmlFor="table_number" className="text-xs font-semibold">
                                Nomor / Nama Meja Kehormatan <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="table_number"
                                value={data.table_number}
                                onChange={(e) => setData('table_number', e.target.value)}
                                placeholder="Contoh: Meja VVIP 01 / Baris Depan A-2"
                                className={errors.table_number ? 'border-rose-500' : ''}
                            />
                            {errors.table_number && <p className="text-xs text-rose-500">{errors.table_number}</p>}
                        </div>

                        {/* Seat Count */}
                        <div className="space-y-1.5">
                            <Label htmlFor="seat_count" className="text-xs font-semibold">
                                Kapasitas Kursi (Pax) <span className="text-slate-400 font-normal">(Termasuk Pendamping)</span>
                            </Label>
                            <Input
                                id="seat_count"
                                type="number"
                                min={1}
                                max={50}
                                value={data.seat_count}
                                onChange={(e) => setData('seat_count', e.target.value)}
                                className={errors.seat_count ? 'border-rose-500' : ''}
                            />
                            {errors.seat_count && <p className="text-xs text-rose-500">{errors.seat_count}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold">
                                No. Telepon / WhatsApp Protokoler <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className={errors.phone ? 'border-rose-500' : ''}
                            />
                            {errors.phone && <p className="text-xs text-rose-500">{errors.phone}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold">
                                Email Konfirmasi <span className="text-slate-400 font-normal">(Opsional)</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="sekretariat@instansi.go.id"
                                className={errors.email ? 'border-rose-500' : ''}
                            />
                            {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Foto Tamu (Opsional) Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                        Foto Tamu Undangan <span className="text-xs font-normal text-slate-500">(Opsional)</span>
                    </CardTitle>
                    <CardDescription>
                        Foto bersifat fleksibel/opsional. Kartu pass tamu kehormatan secara default menampilkan lambang VIP emas resmi jika foto tidak dilampirkan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Preview Box */}
                        <div className="relative h-36 w-28 shrink-0 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col items-center justify-center overflow-hidden">
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
                                <div className="text-center p-3 text-amber-500">
                                    <Crown className="h-10 w-10 mx-auto stroke-[1.5]" />
                                    <span className="text-[10px] mt-1 block font-bold uppercase tracking-wider">VIP</span>
                                </div>
                            )}
                        </div>

                        {/* File Uploader */}
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="photo" className="text-xs font-semibold block">
                                Berkas Foto Resmi (JPG, PNG, WebP &bull; Maks. 2MB)
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
                                        title={`Foto Tamu: ${data.name || 'Pratinjau'}`}
                                    />
                                </div>
                            )}
                            {errors.photo && <p className="text-xs text-rose-500">{errors.photo}</p>}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5 pt-2">
                        <Label htmlFor="notes" className="text-xs font-semibold">
                            Catatan Khusus Tamu / Protokoler <span className="text-slate-400 font-normal">(Opsional)</span>
                        </Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Keterangan protokoler khusus, waktu penjemputan, sambutan, dll..."
                            rows={3}
                        />
                        {errors.notes && <p className="text-xs text-rose-500">{errors.notes}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" type="button" asChild>
                    <Link href="/admin/companies/guests">
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
                            {isEdit ? 'Perbarui Data Tamu' : 'Simpan Tamu Undangan'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
