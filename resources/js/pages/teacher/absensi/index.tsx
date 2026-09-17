import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/teacher';
import absensi from '@/routes/teacher/absensi';
import { usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    Filter,
    GraduationCap,
    Layers,
    Plus,
    Search,
    Sparkles,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Sanggar = {
    id: number | string;
    name: string;
    type?: string;
};

type StudentItem = {
    student_id: number;
    name: string;
    nik?: string;
    nis?: string;
    gender?: string;
    school_name?: string;
    class?: string;
    sanggar_ids?: (number | string)[];
    sanggar_id?: number | string;
};

type AttendanceStatus = 'present' | 'sick' | 'permitted' | 'absent';

type SessionHistory = {
    id: string;
    sanggar_id: number | string;
    sanggar_name: string;
    date: string;
    time: string;
    module_title: string;
    step_topic: string;
    total_students: number;
    present_count: number;
    sick_count: number;
    permitted_count: number;
    absent_count: number;
    notes?: string;
};

export default function AbsensiPage() {
    const { sanggars = [], students = [] } = usePage<{
        sanggars?: Sanggar[];
        students?: StudentItem[];
    }>().props;

    const [selectedSanggarFilter, setSelectedSanggarFilter] =
        useState<string>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchStudent, setSearchStudent] = useState('');

    // Sample initial teaching sessions
    const [sessions, setSessions] = useState<SessionHistory[]>([
        {
            id: 'sess-1',
            sanggar_id: sanggars[0]?.id ?? 1,
            sanggar_name: sanggars[0]?.name ?? 'Sanggar Binaan Utama',
            date: new Date().toISOString().slice(0, 10),
            time: '15:30 - 17:00 WIB',
            module_title: 'Modul Matematika: Pecahan & Desimal',
            step_topic: 'Pertemuan 4: Operasi Perkalian & Pembagian Pecahan',
            total_students: students.length || 8,
            present_count: Math.max((students.length || 8) - 1, 1),
            sick_count: 1,
            permitted_count: 0,
            absent_count: 0,
            notes: 'Santri sangat antusias mengerjakan latihan soal cerita pecahan.',
        },
    ]);

    // Modal Form State
    const [formData, setFormData] = useState({
        sanggar_id: sanggars[0]?.id ? String(sanggars[0].id) : '',
        date: new Date().toISOString().slice(0, 10),
        time_slot: 'Sore (15:30 - 17:00 WIB)',
        module_title: '',
        step_topic: '',
        general_notes: '',
    });

    const [studentAttendance, setStudentAttendance] = useState<
        Record<
            number,
            {
                status: AttendanceStatus;
                individual_note?: string;
            }
        >
    >({});

    // Filtered students based on selected sanggar in modal
    const modalStudents = useMemo(() => {
        if (!formData.sanggar_id) {
            return students;
        }

        const sid = Number(formData.sanggar_id);

        return students.filter((s) => {
            if (s.sanggar_id && Number(s.sanggar_id) === sid) {
                return true;
            }

            if (
                s.sanggar_ids &&
                s.sanggar_ids.some((id) => Number(id) === sid)
            ) {
                return true;
            }

            return false;
        });
    }, [students, formData.sanggar_id]);

    // Filtered students with search
    const filteredModalStudents = useMemo(() => {
        if (!searchStudent) {
            return modalStudents;
        }

        const q = searchStudent.toLowerCase();

        return modalStudents.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                (s.school_name && s.school_name.toLowerCase().includes(q)),
        );
    }, [modalStudents, searchStudent]);

    // Open Modal Handler
    const handleOpenModal = () => {
        const initialStatus: Record<
            number,
            { status: AttendanceStatus; individual_note?: string }
        > = {};
        modalStudents.forEach((s) => {
            initialStatus[s.student_id] = { status: 'present' };
        });
        setStudentAttendance(initialStatus);
        setIsCreateModalOpen(true);
    };

    // Mark all as present
    const markAllPresent = () => {
        const updated: Record<
            number,
            { status: AttendanceStatus; individual_note?: string }
        > = {};
        modalStudents.forEach((s) => {
            updated[s.student_id] = {
                status: 'present',
                individual_note:
                    studentAttendance[s.student_id]?.individual_note ?? '',
            };
        });
        setStudentAttendance(updated);
    };

    // Update single student attendance
    const setStatus = (studentId: number, status: AttendanceStatus) => {
        setStudentAttendance((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
            },
        }));
    };

    // Calculate Realtime Counts in Modal
    const attendanceSummary = useMemo(() => {
        let present = 0;
        let sick = 0;
        let permitted = 0;
        let absent = 0;

        modalStudents.forEach((s) => {
            const st = studentAttendance[s.student_id]?.status ?? 'present';

            if (st === 'present') {
                present++;
            } else if (st === 'sick') {
                sick++;
            } else if (st === 'permitted') {
                permitted++;
            } else if (st === 'absent') {
                absent++;
            }
        });

        return {
            present,
            sick,
            permitted,
            absent,
            total: modalStudents.length,
        };
    }, [modalStudents, studentAttendance]);

    // Save Session Handler
    const handleSaveSession = () => {
        const targetSanggar = sanggars.find(
            (s) => String(s.id) === formData.sanggar_id,
        );

        const newSession: SessionHistory = {
            id: `sess-${Date.now()}`,
            sanggar_id: formData.sanggar_id,
            sanggar_name: targetSanggar?.name ?? 'Sanggar Binaan',
            date: formData.date,
            time: formData.time_slot,
            module_title:
                formData.module_title || 'Pembinaan & Pendalaman Materi',
            step_topic: formData.step_topic || 'Pertemuan Tatap Muka Rutin',
            total_students: modalStudents.length,
            present_count: attendanceSummary.present,
            sick_count: attendanceSummary.sick,
            permitted_count: attendanceSummary.permitted,
            absent_count: attendanceSummary.absent,
            notes: formData.general_notes,
        };

        setSessions([newSession, ...sessions]);
        setIsCreateModalOpen(false);
    };

    // Filtered sessions for main view
    const filteredSessions = useMemo(() => {
        if (selectedSanggarFilter === 'all') {
            return sessions;
        }

        return sessions.filter(
            (s) => String(s.sanggar_id) === selectedSanggarFilter,
        );
    }, [sessions, selectedSanggarFilter]);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A] text-white shadow-sm">
                            <ClipboardCheck className="size-5" />
                        </span>
                        Presensi &amp; Jurnal Mengajar
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Kelola absensi kehadiran santri binaan dan pantau
                        capaian step modul pembelajaran per sanggar.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-48 sm:w-56">
                        <Select
                            value={selectedSanggarFilter}
                            onValueChange={setSelectedSanggarFilter}
                        >
                            <SelectTrigger className="w-full bg-card">
                                <Filter className="mr-2 size-4 text-primary" />
                                <SelectValue placeholder="Pilih Sanggar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Sanggar Binaan
                                </SelectItem>
                                {sanggars.map((sg) => (
                                    <SelectItem
                                        key={String(sg.id)}
                                        value={String(sg.id)}
                                    >
                                        {sg.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleOpenModal}
                        className="bg-[#17524A] text-white hover:bg-[#12423b]"
                    >
                        <Plus className="mr-2 size-4" />
                        Input Absensi Baru
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-[#17524A] shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Total Pertemuan
                        </CardTitle>
                        <Calendar className="size-4 text-[#17524A]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            {sessions.length} Sesi
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Tercatat di jurnal sanggar
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#E5BE1E] shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Rata-Rata Hadir
                        </CardTitle>
                        <UserCheck className="size-4 text-[#E5BE1E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            95.8%
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Tingkat kehadiran santri
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#17524A] shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Santri Terbina
                        </CardTitle>
                        <Users className="size-4 text-[#17524A]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            {students.length} Santri
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Aktif di sanggar Anda
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Progres Modul
                        </CardTitle>
                        <BookOpen className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            Aktif
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Sesuai silabus Penyaluran
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs Container */}
            <Tabs defaultValue="history" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 sm:w-80">
                    <TabsTrigger value="history">Jurnal Pertemuan</TabsTrigger>
                    <TabsTrigger value="students">Rekap Santri</TabsTrigger>
                </TabsList>

                {/* Tab 1: Jurnal Pertemuan */}
                <TabsContent value="history" className="space-y-4">
                    {filteredSessions.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-12 text-center">
                            <Layers className="size-12 text-muted-foreground/40" />
                            <h3 className="mt-4 text-lg font-semibold">
                                Belum Ada Riwayat Sesi
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                Mulai catat kehadiran dan modul yang diajarkan
                                hari ini dengan menekan tombol di bawah.
                            </p>
                            <Button
                                onClick={handleOpenModal}
                                className="mt-4 bg-[#17524A] text-white hover:bg-[#12423b]"
                            >
                                <Plus className="mr-2 size-4" /> Input Sesi
                                Pertama
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {filteredSessions.map((session) => (
                                <Card
                                    key={session.id}
                                    className="overflow-hidden border-2 transition-all hover:border-[#17524A]/40 hover:shadow-md"
                                >
                                    <div className="border-b bg-muted/40 px-5 py-3">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="outline"
                                                className="border-[#17524A] font-semibold text-[#17524A]"
                                            >
                                                {session.sanggar_name}
                                            </Badge>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="size-3.5" />
                                                <span>{session.time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="space-y-4 p-5">
                                        <div>
                                            <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-primary uppercase">
                                                <Calendar className="size-3.5" />
                                                <span>
                                                    {new Date(
                                                        session.date,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            <h3 className="mt-1 text-base font-bold text-foreground">
                                                {session.module_title}
                                            </h3>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {session.step_topic}
                                            </p>
                                        </div>

                                        {/* Attendance Pills */}
                                        <div className="grid grid-cols-4 gap-2 rounded-xl bg-muted/30 p-2.5 text-center">
                                            <div className="rounded-lg bg-emerald-50 p-1.5 dark:bg-emerald-950/30">
                                                <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                    Hadir
                                                </span>
                                                <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                                                    {session.present_count}
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-amber-50 p-1.5 dark:bg-amber-950/30">
                                                <span className="block text-xs font-semibold text-amber-700 dark:text-amber-400">
                                                    Sakit
                                                </span>
                                                <span className="text-sm font-black text-amber-800 dark:text-amber-300">
                                                    {session.sick_count}
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-sky-50 p-1.5 dark:bg-sky-950/30">
                                                <span className="block text-xs font-semibold text-sky-700 dark:text-sky-400">
                                                    Izin
                                                </span>
                                                <span className="text-sm font-black text-sky-800 dark:text-sky-300">
                                                    {session.permitted_count}
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-rose-50 p-1.5 dark:bg-rose-950/30">
                                                <span className="block text-xs font-semibold text-rose-700 dark:text-rose-400">
                                                    Alpa
                                                </span>
                                                <span className="text-sm font-black text-rose-800 dark:text-rose-300">
                                                    {session.absent_count}
                                                </span>
                                            </div>
                                        </div>

                                        {session.notes && (
                                            <p className="border-l-2 border-primary/40 pl-3 text-xs text-muted-foreground italic">
                                                "{session.notes}"
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Tab 2: Rekap Santri */}
                <TabsContent value="students">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">
                                Daftar Santri Binaan
                            </CardTitle>
                            <CardDescription>
                                Total {students.length} santri binaan aktif di
                                sanggar Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                {students.map((st, idx) => (
                                    <div
                                        key={st.student_id || idx}
                                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-full bg-[#17524A]/10 font-bold text-[#17524A] dark:bg-[#17524A]/30 dark:text-emerald-400">
                                                {st.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">
                                                    {st.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {st.school_name ??
                                                        'Sekolah Belum Diisi'}{' '}
                                                    &bull; Kelas{' '}
                                                    {st.class ?? '-'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="text-xs font-normal"
                                            >
                                                {st.gender === 'female' ||
                                                st.gender === 'P'
                                                    ? 'Perempuan'
                                                    : 'Laki-laki'}
                                            </Badge>
                                            <Badge className="bg-emerald-600/15 font-semibold text-emerald-700 hover:bg-emerald-600/20 dark:text-emerald-400">
                                                100% Hadir
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Input Attendance Modal Dialog */}
            <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-6">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="size-5 text-[#E5BE1E]" />
                            <DialogTitle className="text-xl font-bold">
                                Input Absensi &amp; Jurnal Sesi
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Isi informasi pertemuan kelas sanggar dan checklist
                            kehadiran santri binaan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 pt-2">
                        {/* Section 1: Detail Sesi */}
                        <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Pilih Sanggar *
                                </Label>
                                <Select
                                    value={formData.sanggar_id}
                                    onValueChange={(v) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            sanggar_id: v,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full bg-background">
                                        <SelectValue placeholder="Pilih Sanggar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sanggars.map((sg) => (
                                            <SelectItem
                                                key={String(sg.id)}
                                                value={String(sg.id)}
                                            >
                                                {sg.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Tanggal Pertemuan *
                                </Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            date: e.target.value,
                                        }))
                                    }
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Waktu / Sesi
                                </Label>
                                <Input
                                    value={formData.time_slot}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            time_slot: e.target.value,
                                        }))
                                    }
                                    placeholder="Contoh: 15:30 - 17:00 WIB"
                                    className="bg-background"
                                />
                            </div>
                        </div>

                        {/* Section 2: Modul & Capaian Pembelajaran */}
                        <div className="space-y-3 rounded-xl border bg-card p-4">
                            <div className="flex items-center gap-2 font-semibold text-foreground">
                                <BookOpen className="size-4 text-primary" />
                                <span>Materi &amp; Step Modul Pengajaran</span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Topik Modul Utama *
                                    </Label>
                                    <Input
                                        value={formData.module_title}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                module_title: e.target.value,
                                            }))
                                        }
                                        placeholder="Contoh: Modul Matematika - Bab 3"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Step / Target Capaian Pertemuan
                                    </Label>
                                    <Input
                                        value={formData.step_topic}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                step_topic: e.target.value,
                                            }))
                                        }
                                        placeholder="Contoh: Operasi Pecahan Campuran (Hal 30)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Checklist Kehadiran Santri */}
                        <div className="space-y-3 rounded-xl border bg-card p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <GraduationCap className="size-4 text-primary" />
                                        <span>
                                            Checklist Kehadiran Santri (
                                            {modalStudents.length})
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Klik tombol status (H/S/I/A) untuk tiap
                                        santri.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={markAllPresent}
                                        className="h-8 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                                    >
                                        <Check className="mr-1 size-3.5" />{' '}
                                        Tandai Semua Hadir
                                    </Button>
                                </div>
                            </div>

                            {/* Summary Bar */}
                            <div className="flex flex-wrap gap-2 rounded-lg bg-muted/40 p-2 text-xs font-medium">
                                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="size-3.5" /> Hadir:{' '}
                                    <strong>{attendanceSummary.present}</strong>
                                </span>
                                <span>&bull;</span>
                                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                    Sakit:{' '}
                                    <strong>{attendanceSummary.sick}</strong>
                                </span>
                                <span>&bull;</span>
                                <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400">
                                    Izin:{' '}
                                    <strong>
                                        {attendanceSummary.permitted}
                                    </strong>
                                </span>
                                <span>&bull;</span>
                                <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400">
                                    <XCircle className="size-3.5" /> Alpa:{' '}
                                    <strong>{attendanceSummary.absent}</strong>
                                </span>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                <Input
                                    value={searchStudent}
                                    onChange={(e) =>
                                        setSearchStudent(e.target.value)
                                    }
                                    placeholder="Cari nama santri di sanggar ini..."
                                    className="h-9 pl-9 text-xs"
                                />
                            </div>

                            {/* Student List Grid */}
                            <div className="max-h-64 divide-y overflow-y-auto rounded-lg border">
                                {filteredModalStudents.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-muted-foreground">
                                        Tidak ada santri ditemukan untuk sanggar
                                        ini.
                                    </div>
                                ) : (
                                    filteredModalStudents.map((st, i) => {
                                        const currentStatus =
                                            studentAttendance[st.student_id]
                                                ?.status ?? 'present';

                                        return (
                                            <div
                                                key={st.student_id || i}
                                                className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-foreground">
                                                        {st.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {st.school_name ?? '-'}{' '}
                                                        &bull; Kelas{' '}
                                                        {st.class ?? '-'}
                                                    </div>
                                                </div>

                                                {/* 4 Status Segmented Buttons */}
                                                <div className="flex shrink-0 gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setStatus(
                                                                st.student_id,
                                                                'present',
                                                            )
                                                        }
                                                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                                                            currentStatus ===
                                                            'present'
                                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                                : 'bg-muted text-muted-foreground hover:bg-emerald-100 hover:text-emerald-800'
                                                        }`}
                                                        title="Hadir"
                                                    >
                                                        H
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setStatus(
                                                                st.student_id,
                                                                'sick',
                                                            )
                                                        }
                                                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                                                            currentStatus ===
                                                            'sick'
                                                                ? 'bg-amber-500 text-white shadow-xs'
                                                                : 'bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-800'
                                                        }`}
                                                        title="Sakit"
                                                    >
                                                        S
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setStatus(
                                                                st.student_id,
                                                                'permitted',
                                                            )
                                                        }
                                                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                                                            currentStatus ===
                                                            'permitted'
                                                                ? 'bg-sky-600 text-white shadow-xs'
                                                                : 'bg-muted text-muted-foreground hover:bg-sky-100 hover:text-sky-800'
                                                        }`}
                                                        title="Izin"
                                                    >
                                                        I
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setStatus(
                                                                st.student_id,
                                                                'absent',
                                                            )
                                                        }
                                                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                                                            currentStatus ===
                                                            'absent'
                                                                ? 'bg-rose-600 text-white shadow-xs'
                                                                : 'bg-muted text-muted-foreground hover:bg-rose-100 hover:text-rose-800'
                                                        }`}
                                                        title="Alpa / Tanpa Keterangan"
                                                    >
                                                        A
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Section 4: Catatan Guru */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Catatan / Evaluasi Sesi Guru (Opsional)
                            </Label>
                            <Textarea
                                value={formData.general_notes}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        general_notes: e.target.value,
                                    }))
                                }
                                placeholder="Tuliskan catatan kemajuan belajar santri atau hal penting pada sesi ini..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveSession}
                            className="bg-[#17524A] text-white hover:bg-[#12423b]"
                        >
                            <SaveIcon className="mr-2 size-4" /> Simpan Sesi
                            Absensi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
            <path d="M7 3v4a1 1 0 0 0 1 1h7" />
        </svg>
    );
}

AbsensiPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Presensi & Jurnal', href: absensi.index().url },
    ],
};
