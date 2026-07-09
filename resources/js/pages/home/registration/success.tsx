import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, ClipboardCheck, Home, Trophy } from 'lucide-react';

type SuccessProps = {
    participant?: {
        registration_number: string;
        full_name: string;
        olimpiade?: string | null;
    };
};

export default function RegistrationSuccessPage() {
    const { participant } = usePage<SuccessProps>().props;

    return (
        <section className="relative overflow-hidden px-5 pt-32 pb-20 lg:px-8">
            <div className="absolute top-20 left-0 h-56 w-56 rounded-[56px] bg-[#5DD39E]/20 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-[64px] bg-[#F15F23]/15 blur-3xl" />
            <div className="relative mx-auto max-w-3xl rounded-[32px] bg-white p-6 text-center shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100 sm:p-10">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#22C55E]/10 text-[#22C55E]">
                    <CheckCircle2 className="h-10 w-10" />
                </span>
                <h1 className="mt-6 text-3xl font-black text-[#1E293B] sm:text-5xl">
                    Pendaftaran berhasil dikirim!
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[#64748B]">
                    Terima kasih, {participant?.full_name ?? 'peserta'}. Tim OMATIQ
                    akan meninjau data dan dokumen pendaftaran kamu.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-[#F8FAFC] p-5">
                        <ClipboardCheck className="mx-auto h-7 w-7 text-[#F15F23]" />
                        <p className="mt-3 text-sm font-black text-[#64748B]">
                            Nomor Registrasi
                        </p>
                        <p className="mt-1 text-xl font-black text-[#1E293B]">
                            {participant?.registration_number}
                        </p>
                    </div>
                    <div className="rounded-3xl bg-[#F8FAFC] p-5">
                        <Trophy className="mx-auto h-7 w-7 text-[#0F60AC]" />
                        <p className="mt-3 text-sm font-black text-[#64748B]">
                            Kategori
                        </p>
                        <p className="mt-1 text-xl font-black text-[#1E293B]">
                            {participant?.olimpiade ?? '-'}
                        </p>
                    </div>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-[#0F60AC] transition hover:-translate-y-1"
                    >
                        <Home className="h-4 w-4" />
                        Kembali ke Home
                    </Link>
                    <Link
                        href="/jadwal"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#F15F23]/25 transition hover:-translate-y-1"
                    >
                        Lihat Jadwal
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
