import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { showErrorAlert, showSuccessAlert } from '@/utils/sweetalert';
import axios from 'axios';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Loader2,
    UploadCloud,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useRef, useState } from 'react';

interface CommitteeImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    divisions?: string[];
    onSuccess: () => void;
}

const DEFAULT_DIVISIONS = [
    'Panitia Pelaksana Babak Final',
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

export function CommitteeImportModal({
    open,
    onOpenChange,
    divisions = [],
    onSuccess,
}: CommitteeImportModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [defaultDivision, setDefaultDivision] = useState<string>('Panitia Pelaksana Babak Final');
    const [updateExisting, setUpdateExisting] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const availableDivisions = Array.from(
        new Set([...divisions.filter(Boolean), ...DEFAULT_DIVISIONS])
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!['csv', 'txt', 'xlsx', 'xls'].includes(ext || '')) {
                setErrorMsg('Format file tidak didukung. Mohon gunakan file .csv atau .xlsx');
                setSelectedFile(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrorMsg('Ukuran file maksimal adalah 5MB.');
                setSelectedFile(null);
                return;
            }
            setErrorMsg(null);
            setSelectedFile(file);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setErrorMsg(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setErrorMsg('Silakan pilih file spreadsheet terlebih dahulu.');
            return;
        }

        setIsUploading(true);
        setErrorMsg(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('default_division', defaultDivision);
        formData.append('update_existing', updateExisting ? '1' : '0');

        try {
            const response = await axios.post('/admin/companies/committees/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onOpenChange(false);
            handleClearFile();

            await showSuccessAlert(
                'Impor Panitia Berhasil!',
                response.data?.message || 'Data panitia berhasil diproses ke dalam sistem.'
            );

            onSuccess();
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.file?.[0] ||
                'Terjadi kesalahan saat memproses file import.';
            setErrorMsg(msg);
            showErrorAlert('Gagal Impor Panitia', msg);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isUploading && onOpenChange(val)}>
            <DialogContent className="max-w-lg sm:max-w-xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                            <FileSpreadsheet className="h-5 w-5 text-amber-500" />
                            Import Data Panitia (Excel / CSV)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Unggah data panitia langsung dari Google Sheet atau Excel. Sistem otomatis membaca kolom Nama Lengkap, Kantor Cabang, NIK, dan Ukuran Kaos.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Download Template Banner */}
                        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs dark:border-amber-900/60 dark:bg-amber-950/20">
                            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                                <Download className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <div>
                                    <div className="font-semibold">Format Google Sheet / CSV</div>
                                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                                        Kolom: <code>Timestamp | Nama Lengkap | Kantor Cabang | NIK | Ukuran Kaos</code>
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-7 text-xs bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100"
                            >
                                <a href="/admin/companies/committees/template" download>
                                    Unduh Contoh CSV
                                </a>
                            </Button>
                        </div>

                        {/* File Upload Box */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                Pilih File Spreadsheet <span className="text-rose-500">*</span>
                            </Label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                onChange={handleFileChange}
                                className="hidden"
                                id="committee-import-file-input"
                            />

                            {!selectedFile ? (
                                <label
                                    htmlFor="committee-import-file-input"
                                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-amber-500 hover:bg-amber-50/30 dark:border-slate-700 dark:hover:border-amber-500 dark:hover:bg-amber-950/20 cursor-pointer transition-colors"
                                >
                                    <UploadCloud className="h-9 w-9 text-slate-400 mb-2" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Klik untuk memilih file atau seret file ke sini
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Mendukung format Google Sheets (CSV) atau Microsoft Excel (.xlsx, .xls) maks. 5MB
                                    </p>
                                </label>
                            ) : (
                                <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/50 p-3 text-xs dark:border-emerald-800 dark:bg-emerald-950/20">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <FileSpreadsheet className="h-6 w-6 text-emerald-600 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearFile}
                                        className="h-7 w-7 text-slate-400 hover:text-rose-500"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-1.5">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}
                        </div>

                        {/* Divisi Default jika tidak ada di spreadsheet */}
                        <div className="space-y-1.5">
                            <Label htmlFor="default_division" className="text-xs font-semibold">
                                Divisi Penugasan Default
                            </Label>
                            <Select value={defaultDivision} onValueChange={setDefaultDivision}>
                                <SelectTrigger id="default_division" className="h-9 text-xs">
                                    <SelectValue placeholder="Pilih divisi panitia" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableDivisions.map((div) => (
                                        <SelectItem key={div} value={div} className="text-xs">
                                            {div}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">
                                Digunakan bila file spreadsheet tidak mencantumkan kolom divisi khusus.
                            </p>
                        </div>

                        {/* Anti-Duplicate Setting */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
                            <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                                <input
                                    type="checkbox"
                                    checked={updateExisting}
                                    onChange={(e) => setUpdateExisting(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                />
                                <div>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        Perbarui data jika NIK / Nama sudah terdaftar
                                    </span>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Mencegah duplikasi data panitia. Jika data panitia sudah ada, sistem akan memperbarui kantor cabang dan ukuran kaos sesuai data terbaru di spreadsheet.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isUploading}
                            className="text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedFile || isUploading}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Memproses Spreadsheet...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                    Mulai Import Panitia
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
