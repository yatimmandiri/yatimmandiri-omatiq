import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import { Head, usePage } from '@inertiajs/react';
import { Award, CheckCircle2, Clock3, FileText, GraduationCap, MapPin, Phone, Sparkles } from 'lucide-react';

const labels: Record<string, string> = { male: 'Laki-laki', female: 'Perempuan', submitted: 'Menunggu Verifikasi', verified: 'Terverifikasi', rejected: 'Ditolak' };
const statusVariant = (s: string) => (s === 'verified' ? 'default' : s === 'rejected' ? 'destructive' : 'secondary');

export default function Dashboard() {
    const { participant } = usePage<{ participant: Record<string, any> }>().props;

    if (!participant) {
        return (
            <>
                <Head title="Dashboard Student" />
                <div className="flex min-h-[60vh] items-center justify-center p-6">
                    <Card className="max-w-md rounded-[2rem] p-8 text-center shadow-sm">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#17524A]/10 text-[#17524A]">
                            <GraduationCap />
                        </div>
                        <h2 className="mt-4 text-xl font-black">Belum Terdaftar</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Akun Anda belum terhubung dengan data peserta. Daftar olimpiade atau hubungi admin.</p>
                        <a href="/olimpiade" className="mt-6 inline-flex rounded-xl bg-[#17524A] px-5 py-2.5 text-sm font-bold text-white">Lihat Olimpiade</a>
                    </Card>
                </div>
            </>
        );
    }

    const isVerified = participant.status === 'verified';

    return (
        <>
            <Head title="Dashboard Student" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#17524A] to-[#0e2e28] p-6 text-white shadow-xl lg:p-7">
                    <div className="absolute -right-10 -top-10 size-64 rounded-full bg-[#E5BE1E]/15 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(229,190,30,0.12),transparent_45%)]" />
                    <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
                                <Sparkles className="size-4 text-[#E5BE1E]" /> OMATIQ 2026
                            </p>
                            <h1 className="mt-2 text-2xl font-black lg:text-3xl">{participant.student?.full_name ?? participant.user?.name}</h1>
                            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/70">
                                <span className="font-mono">{participant.registration_number}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{participant.olimpiade?.name ?? '-'}</span>
                                <Badge variant={statusVariant(participant.status) as any} className="ml-1 bg-white text-[#17524A] hover:bg-white">
                                    {labels[participant.status] ?? participant.status}
                                </Badge>
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
                            <div className={`flex size-10 items-center justify-center rounded-xl ${isVerified ? 'bg-[#E5BE1E] text-[#17524A]' : 'bg-white/15 text-white'}`}>
                                {isVerified ? <CheckCircle2 /> : <Clock3 />}
                            </div>
                            <div>
                                <p className="text-sm font-black">{isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}</p>
                                <p className="text-xs text-white/70">{isVerified ? 'Siap tanding!' : 'Admin akan cek pembayaran'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline status */}
                <Card className="rounded-[1.5rem] p-5">
                    <div className="flex items-center gap-2 text-sm font-black">
                        <Award className="size-4 text-[#17524A]" /> Status Pendaftaran
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                            { key: 'submitted', label: 'Dikirim' },
                            { key: 'verified', label: 'Verifikasi' },
                            { key: 'verified', label: 'Selesai', final: true },
                        ].map((s, i) => {
                            const active = participant.status === s.key || (s.final && isVerified);
                            const done = i === 0 || isVerified;
                            return (
                                <div key={i} className={`rounded-2xl p-3 text-center text-xs font-bold ${done ? 'bg-[#17524A] text-white' : 'bg-zinc-100 text-muted-foreground dark:bg-zinc-800'}`}>
                                    <div className={`mx-auto mb-1 flex size-6 items-center justify-center rounded-full text-[11px] ${done ? 'bg-[#E5BE1E] text-[#17524A]' : 'bg-white dark:bg-zinc-700'}`}>{i + 1}</div>
                                    {s.label}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <Card className="rounded-[1.5rem] p-6">
                        <h2 className="flex items-center gap-2 text-base font-black">
                            <FileText className="size-4 text-[#17524A]" /> Biodata
                        </h2>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <Detail label="Nama" value={participant.student?.full_name} />
                            <Detail label="Panggilan" value={participant.student?.nickname} />
                            <Detail label="Gender" value={labels[participant.student?.gender] ?? '-'} />
                            <Detail label="TTL" value={`${participant.student?.birth_place ?? ''}${participant.student?.birth_date ? ', ' + participant.student?.birth_date.slice(0, 10) : ''}`} />
                            <Detail label="Sekolah" value={participant.student?.school_name} />
                            <Detail label="Jenjang" value={participant.student?.school_level} />
                            <Detail label="Kelas" value={participant.student?.grade} />
                            <Detail label="NIS" value={participant.student?.nis} />
                            <Detail label="Provinsi" value={participant.student?.province?.name} />
                            <Detail label="Kota/Kab" value={participant.student?.regency?.name} />
                            <Detail label="HP Wali" value={participant.student?.parent_phone} icon={<Phone className="size-3" />} />
                            <Detail label="Alamat" value={participant.student?.address} full />
                        </div>
                    </Card>

                    <div className="flex flex-col gap-6">
                        <Card className="rounded-[1.5rem] bg-gradient-to-br from-[#E5BE1E]/15 to-transparent p-6">
                            <h2 className="flex items-center gap-2 text-base font-black">
                                <GraduationCap className="size-4 text-[#17524A]" /> Olimpiade
                            </h2>
                            <p className="mt-2 text-lg font-black text-[#17524A]">{participant.olimpiade?.name ?? '-'}</p>
                            <p className="text-sm text-muted-foreground">{participant.olimpiade?.category ?? ''}</p>
                            <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 text-sm dark:bg-zinc-900">
                                <Detail label="Mentor" value={participant.student?.mentor_name} />
                                <Detail label="HP Mentor" value={participant.student?.mentor_phone} />
                                <Detail label="Cabang" value={participant.branch} icon={<MapPin className="size-3" />} />
                                <Detail label="Referral" value={participant.referral_source} />
                            </div>
                        </Card>

                        <Card className="rounded-[1.5rem] p-6">
                            <h2 className="text-base font-black">Dokumen</h2>
                            <div className="mt-4 grid gap-3">
                                <Doc label="Pas Foto" href={participant.student?.photo_url} />
                                <Doc label="Kartu Pelajar" href={participant.student?.student_card_url} />
                                <Doc label="Identitas / KK" href={participant.student?.identity_card_url} />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard().url }] };

const Detail = ({ label, value, icon, full }: { label: string; value?: any; icon?: React.ReactNode; full?: boolean }) => (
    <div className={full ? 'sm:col-span-2' : ''}>
        <p className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            {icon} {label}
        </p>
        <p className="mt-1 text-sm font-semibold leading-6">{value || '-'}</p>
    </div>
);

const Doc = ({ label, href }: { label: string; href?: string | null }) => (
    <a href={href ?? undefined} target={href ? '_blank' : undefined} className={`flex items-center justify-between rounded-2xl border p-3 text-sm font-semibold transition ${href ? 'bg-white hover:bg-zinc-50 dark:bg-zinc-900' : 'bg-zinc-50 opacity-60 dark:bg-zinc-800'}`}>
        <span>{label}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${href ? 'bg-[#17524A] text-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>{href ? 'Lihat' : '-'}</span>
    </a>
);
