import home from '@/routes/home';
import type { AuthLayoutProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    GraduationCap,
    Lock,
    Sparkles,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name, flash, settings } = usePage<any>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    const logoWhite = '/assets/images/LOGO OMATIQ WHITE.png';
    const logoColor = settings?.logo
        ? settings.logo.startsWith('http') || settings.logo.startsWith('/')
            ? settings.logo
            : `/storage/${settings.logo}`
        : '/assets/images/LOGO OMATIQ-new.png';

    return (
        <div className="relative min-h-screen w-full bg-slate-50/60 lg:grid lg:grid-cols-12 dark:bg-slate-950">
            {/* Left Decorative & Branding Panel */}
            <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-[#11423B] p-10 text-white lg:col-span-5 lg:flex xl:col-span-6">
                {/* Subtle Background Glow & Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#134e45] via-[#17524A] to-[#0d2f2a]" />
                <div className="absolute -top-24 -left-24 size-96 rounded-full bg-[#E5BE1E]/15 blur-3xl" />
                <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-emerald-400/10 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                {/* Top Header & Back Button */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link
                        href={home.index().url}
                        className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-medium text-white/90 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/20 hover:text-white"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <div className="flex items-center gap-2 rounded-full border border-[#E5BE1E]/30 bg-[#E5BE1E]/10 px-3 py-1 text-xs font-semibold text-[#FFE600] backdrop-blur-md">
                        <Sparkles className="size-3.5" />
                        <span>Portal Resmi OMATIQ</span>
                    </div>
                </div>

                {/* Center Content: Logo, Title, and Value Highlights */}
                <div className="relative z-10 my-auto py-12">
                    <div className="mb-6 flex items-center gap-4">
                        <img
                            src={logoWhite}
                            alt={name || 'OMATIQ Logo'}
                            className="h-14 w-auto object-contain drop-shadow-md"
                            onError={(e) => {
                                // Fallback to text if image not found
                                (e.currentTarget as HTMLElement).style.display =
                                    'none';
                            }}
                        />
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white xl:text-4xl">
                        Olimpiade Matematika <br />
                        <span className="bg-gradient-to-r from-[#FFE600] via-[#E5BE1E] to-amber-200 bg-clip-text text-transparent">
                            & Al-Qur'an
                        </span>
                    </h1>

                    <p className="mt-4 max-w-md text-base leading-relaxed text-emerald-100/90">
                        Wadah prestasi kompetisi nasional anak yatim & dhuafa
                        Indonesia bersama Lembaga Amil Zakat Nasional Yatim
                        Mandiri.
                    </p>

                    {/* Feature Highlight Cards */}
                    <div className="mt-8 grid max-w-lg gap-3">
                        <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-colors hover:bg-white/10">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E5BE1E]/20 text-[#FFE600]">
                                <Award className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">
                                    Kompetisi Bergengsi Nasional
                                </h2>
                                <p className="text-xs text-emerald-100/80">
                                    Standar ujian terpadu & sertifikasi resmi
                                    dari Yatim Mandiri.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-colors hover:bg-white/10">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                                <GraduationCap className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">
                                    Terintegrasi Sanggar Genius & Quran
                                </h2>
                                <p className="text-xs text-emerald-100/80">
                                    Sinkronisasi data santri binaan, guru, dan
                                    cabang secara real-time.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-colors hover:bg-white/10">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">
                                    Transparansi & Akuntabilitas
                                </h2>
                                <p className="text-xs text-emerald-100/80">
                                    Hasil dan kartu peserta dapat diakses
                                    langsung secara mandiri.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="relative z-10 border-t border-white/10 pt-4">
                    <p className="text-xs text-emerald-100/70 italic">
                        "Membangun generasi cerdas berprestasi dan berakhlak
                        mulia."
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/90">
                        © {new Date().getFullYear()} Yayasan Yatim Mandiri. All
                        rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 lg:col-span-7 xl:col-span-6">
                {/* Mobile Top Navigation */}
                <div className="absolute top-4 left-4 lg:hidden">
                    <Link
                        href={home.index().url}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Beranda</span>
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-md py-8">
                    {/* Mobile Brand Logo */}
                    <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                        <Link href={home.index().url}>
                            <img
                                src={logoColor}
                                alt="OMATIQ Logo"
                                className="h-12 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Form Header */}
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Auth Card Container */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none">
                        {children}
                    </div>

                    {/* Bottom Help / Security Notice */}
                    <div className="mt-6 flex flex-col items-center gap-2 text-center">
                        <p className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Lock className="size-3.5 text-slate-400" />
                            <span>
                                Koneksi aman & terenkripsi. Data Anda
                                dilindungi.
                            </span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Memerlukan bantuan? Hubungi panitia pelaksana OMATIQ
                            melalui kontak resmi Yatim Mandiri.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
