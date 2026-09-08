import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Award, BookOpenCheck, Building2, CheckCircle2, GraduationCap, Sparkles, Users } from 'lucide-react';
import type { ReactNode } from 'react';

type BiodataCompleteness = {
    percent: number;
    is_complete: boolean;
    filled: number;
    total: number;
};

export default function Dashboard() {
    const { studentCount, penyaluranTotal, sanggarCount, registeredCount, biodata, biodataCompleteness, auth } = usePage<{
        studentCount: number;
        penyaluranTotal?: number | null;
        sanggarCount?: number;
        registeredCount?: number;
        biodata?: Record<string, any>;
        biodataCompleteness?: BiodataCompleteness;
        auth?: { user?: { name?: string } };
    }>().props;

    const totalBinaan = penyaluranTotal ?? studentCount;
    const totalRegistered = registeredCount ?? 0;
    const unregisteredCount = Math.max(totalBinaan - totalRegistered, 0);
    const percent = biodataCompleteness?.percent ?? 0;
    const userName = (auth as any)?.user?.name ?? biodata?.name ?? 'Guru';
    const hour = new Date().getHours();
    const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 19 ? 'Selamat Sore' : 'Selamat Malam';

    return (
        <>
            <Head title="Dashboard Guru" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Hero — brand gradient #17524A → #0f3d36 + yellow accent */}
                <div className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-[#17524A] via-[#0f3d36] to-[#12372f] p-6 text-white shadow-xl lg:p-8">
                    <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#E5BE1E]/15 blur-3xl" />
                    <div className="absolute -bottom-20 -left-10 size-72 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(229,190,30,0.15),transparent_50%)]" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex gap-4">
                            <div className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur md:flex">
                                <GraduationCap className="size-7 text-[#E5BE1E]" />
                            </div>
                            <div>
                                <p className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
                                    <Sparkles className="size-4 text-[#E5BE1E]" />
                                    {greeting}, {userName}!
                                </p>
                                <h1 className="mt-1 text-2xl font-black tracking-tight lg:text-3xl">Dashboard Guru</h1>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                                    Kelola binaan, pantau sanggar, dan selesaikan pendaftaran OMATIQ dalam satu tempat.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                                        <Building2 className="size-3.5" /> {sanggarCount ?? 0} Sanggar
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5BE1E] px-3 py-1 text-xs font-black text-[#17524A]">
                                        <Users className="size-3.5" /> {totalBinaan} Binaan
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                            <Link href="/teacher/biodata" prefetch className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E5BE1E] px-5 py-3 text-sm font-black text-[#17524A] shadow-lg shadow-black/10 transition hover:translate-y-[-2px] hover:bg-[#d9b01c]">
                                Lengkapi Biodata <ArrowRight className="size-4" />
                            </Link>
                            <Link href="/admin/data-binaan" prefetch className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">
                                <BookOpenCheck className="size-4" /> Kelola Binaan
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats — 4 cards with accent */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={<Users />} label="Total Binaan" value={totalBinaan} hint={penyaluranTotal != null ? 'Sinkron Penyaluran' : 'Data lokal'} accent="#17524A" />
                    <StatCard icon={<Building2 />} label="Total Sanggar" value={sanggarCount ?? 0} hint="Unit binaan" accent="#E5BE1E" darkText />
                    <StatCard icon={<CheckCircle2 />} label="Sudah Terdaftar" value={totalRegistered} hint={`${percent}% biodata`} accent="#22c55e" />
                    <StatCard icon={<Award />} label="Belum Terdaftar" value={unregisteredCount} hint="Perlu didaftarkan" accent="#f97316" />
                </div>

                {/* Biodata completeness — circular progress */}
                {biodataCompleteness && (
                    <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-white p-0 shadow-sm dark:bg-zinc-900">
                        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-7">
                            <div className="flex gap-5">
                                <div className="relative size-20 shrink-0">
                                    <svg className="size-20 -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" strokeWidth="10" />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="42"
                                            fill="none"
                                            stroke="currentColor"
                                            className={percent === 100 ? 'text-[#17524A]' : 'text-[#E5BE1E]'}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${percent * 2.64} 264`}
                                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                                        />
                                    </svg>
                                    <span className="absolute inset-0 grid place-items-center text-sm font-black">{percent}%</span>
                                </div>
                                <div>
                                    <h2 className="text-base font-black">Kelengkapan Biodata</h2>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        {biodataCompleteness.is_complete
                                            ? 'Biodata lengkap! Kamu bisa fokus mendaftarkan binaan.'
                                            : `Masih ${biodataCompleteness.total - biodataCompleteness.filled} field lagi — lengkapi biar pendaftaran lancar.`}
                                    </p>
                                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                        <div className="h-full rounded-full bg-gradient-to-r from-[#17524A] to-[#E5BE1E] transition-all" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center gap-3 rounded-2xl bg-[#17524A]/5 p-4 dark:bg-white/5">
                                <p className="text-sm font-semibold">Aksi cepat</p>
                                <div className="flex flex-wrap gap-2">
                                    <Link href="/teacher/biodata" prefetch className="inline-flex items-center gap-2 rounded-xl bg-[#17524A] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#14463f]">
                                        {percent === 100 ? 'Perbarui Biodata' : 'Lengkapi Sekarang'} <ArrowRight className="size-4" />
                                    </Link>
                                    <Link href="/admin/data-binaan" prefetch className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:ring-zinc-700">
                                        Lihat Binaan
                                    </Link>
                                </div>
                                <p className="text-xs text-muted-foreground">Data tersinkron langsung ke Penyaluran — single source of truth.</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Next step */}
                <Card className="rounded-[1.75rem] border-dashed bg-gradient-to-br from-[#E5BE1E]/10 via-transparent to-[#17524A]/5 p-6 lg:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#17524A] text-white">
                                <BookOpenCheck className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-black">Siap daftarkan binaan?</h2>
                                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                                    Pilih binaan yang belum terdaftar, pilih kategori olimpiade, dan submit — status otomatis <span className="font-semibold text-[#17524A]">verified</span> karena sudah terverifikasi Penyaluran.
                                </p>
                            </div>
                        </div>
                        <Link href="/admin/data-binaan" prefetch className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#17524A] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#0f3d36]">
                            Buka Daftar Binaan <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </Card>
            </div>
        </>
    );
}

const StatCard = ({ icon, label, value, hint, accent, darkText }: { icon: ReactNode; label: string; value: number; hint: string; accent: string; darkText?: boolean }) => (
    <Card className="group relative overflow-hidden rounded-[1.5rem] border-0 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900">
        <div className="absolute right-0 top-0 size-24 rounded-full blur-2xl opacity-10" style={{ background: accent }} />
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-black tracking-tight">{value.toLocaleString('id-ID')}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{hint}</p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm" style={{ background: accent, color: darkText ? '#17524A' : 'white' }}>
                <span className="[&>svg]:size-6">{icon}</span>
            </div>
        </div>
    </Card>
);
