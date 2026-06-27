import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    GraduationCap,
    Loader2,
    Mail,
    MapPin,
    Menu,
    Globe2,
    MessageCircle,
    Phone,
    Search,
    Send,
    Sparkles,
    Star,
    Trophy,
    Users,
    X,
    Calendar,
} from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
    NewsItem,
    OlimpiadeItem,
    TestimonialItem,
    navItems,
} from './site-data';

type SharedSettings = {
    site_name?: string;
    site_description?: string;
    email?: string;
    phone?: string;
    address?: string;
    logo?: string | null;
    social?: Partial<
        Record<'facebook' | 'instagram' | 'youtube' | 'whatsapp', string | null>
    >;
};

type PageProps = {
    settings?: SharedSettings;
};

const getSettings = () => usePage<PageProps>().props.settings ?? {};

export const MarketingShell = ({ children }: { children: ReactNode }) => {
    return (
        <div
            className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]"
            style={{
                fontFamily:
                    'Plus Jakarta Sans, Inter, ui-sans-serif, system-ui, sans-serif',
            }}
        >
            <Navbar />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

export const Navbar = () => {
    const [open, setOpen] = useState(false);
    const settings = getSettings();
    const currentPath =
        typeof window === 'undefined' ? '/' : window.location.pathname;

    return (
        <header className="sticky top-0 z-50 border-b border-white/70 bg-white/85 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
                <Link
                    href="/"
                    className="flex items-center gap-3"
                    aria-label="OMATIQ home"
                >
                    <BrandMark logo={settings.logo} />
                    <div>
                        <p className="text-lg font-black tracking-tight text-[#0F60AC]">
                            {settings.site_name || 'OMATIQ'}
                        </p>
                        <p className="text-xs font-semibold text-[#64748B]">
                            Learn. Create. Grow.
                        </p>
                    </div>
                </Link>

                <nav
                    className="hidden items-center gap-2 lg:flex"
                    aria-label="Main navigation"
                >
                    {navItems.map((item) => {
                        const isActive =
                            currentPath === item.href ||
                            (item.href !== '/' &&
                                currentPath.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                                    isActive
                                        ? 'bg-[#0F60AC]/10 text-[#0F60AC]'
                                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F60AC]'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <Link
                        href="/kontak"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#F15F23] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#F15F23]/25 transition hover:-translate-y-0.5 hover:bg-[#d94f18]"
                    >
                        Join Community
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0F60AC] shadow-sm lg:hidden"
                    aria-label="Toggle navigation"
                    aria-expanded={open}
                >
                    {open ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </div>

            {open && (
                <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl lg:hidden">
                    <nav
                        className="mx-auto flex max-w-7xl flex-col gap-2"
                        aria-label="Mobile navigation"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-xl px-4 py-3 text-sm font-bold text-[#1E293B] transition hover:bg-[#F8FAFC] hover:text-[#0F60AC]"
                                onClick={() => setOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href="/kontak"
                            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-5 py-3 text-sm font-black text-white"
                            onClick={() => setOpen(false)}
                        >
                            Join Community
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export const Footer = () => {
    const settings = getSettings();

    return (
        <footer className="bg-[#0F60AC] text-white">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.3fr_0.8fr_0.8fr_1fr] lg:px-8">
                <div>
                    <div className="flex items-center gap-3">
                        <BrandMark logo={settings.logo} inverse />
                        <div>
                            <p className="text-xl font-black">
                                {settings.site_name || 'OMATIQ'}
                            </p>
                            <p className="text-sm font-semibold text-white/70">
                                Education meets community energy.
                            </p>
                        </div>
                    </div>
                    <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
                        {settings.site_description ||
                            'OMATIQ membantu pelajar, pengajar, dan komunitas tumbuh lewat olimpiade belajar yang kreatif, hangat, dan berdampak.'}
                    </p>
                    <div className="mt-6 flex gap-3">
                        {[
                            {
                                icon: MessageCircle,
                                label: 'Instagram',
                                href: settings.social?.instagram || '#',
                            },
                            {
                                icon: Globe2,
                                label: 'Facebook',
                                href: settings.social?.facebook || '#',
                            },
                            {
                                icon: Send,
                                label: 'Youtube',
                                href: settings.social?.youtube || '#',
                            },
                            { icon: Users, label: 'LinkedIn', href: '#' },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                aria-label={item.label}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:-translate-y-0.5 hover:bg-white/20"
                            >
                                <item.icon className="h-5 w-5" />
                            </a>
                        ))}
                    </div>
                </div>

                <FooterColumn title="Explore" links={navItems} />
                <FooterColumn
                    title="Olimpiade"
                    links={[
                        { label: 'Digital Skills', href: '/olimpiade' },
                        { label: 'Community', href: '/olimpiade' },
                        { label: 'Education', href: '/olimpiade' },
                        { label: 'Creative Lab', href: '/olimpiade' },
                    ]}
                />

                <div>
                    <h3 className="text-sm font-black tracking-wider text-[#FFC857] uppercase">
                        Newsletter
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-white/75">
                        Dapatkan kabar olimpiade, cerita komunitas, dan insight
                        pembelajaran terbaru.
                    </p>
                    <form
                        className="mt-5 flex overflow-hidden rounded-2xl bg-white p-1 shadow-lg"
                        onSubmit={(event) => {
                            event.preventDefault();
                            toast.success(
                                'Terima kasih, kamu masuk daftar newsletter OMATIQ.',
                            );
                        }}
                    >
                        <input
                            className="min-w-0 flex-1 px-4 text-sm font-semibold text-[#1E293B] outline-none"
                            placeholder="Email kamu"
                            type="email"
                            required
                        />
                        <button
                            type="submit"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F15F23] text-white"
                            aria-label="Subscribe newsletter"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>

            <div className="border-t border-white/10 px-5 py-6">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-semibold text-white/65 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p>
                        Copyright {new Date().getFullYear()} OMATIQ. All rights
                        reserved.
                    </p>
                    <p>Made for curious learners and brave communities.</p>
                </div>
            </div>
        </footer>
    );
};

const FooterColumn = ({
    title,
    links,
}: {
    title: string;
    links: Array<{ label: string; href: string }>;
}) => (
    <div>
        <h3 className="text-sm font-black tracking-wider text-[#FFC857] uppercase">
            {title}
        </h3>
        <div className="mt-4 flex flex-col gap-3">
            {links.map((item) => (
                <Link
                    key={`${title}-${item.href}-${item.label}`}
                    href={item.href}
                    className="text-sm font-semibold text-white/75 transition hover:text-white"
                >
                    {item.label}
                </Link>
            ))}
        </div>
    </div>
);

export const BrandMark = ({
    logo,
    inverse = false,
}: {
    logo?: string | null;
    inverse?: boolean;
}) => {
    if (logo) {
        return (
            <img
                src={logo}
                alt="OMATIQ logo"
                className="h-11 w-11 rounded-2xl object-contain"
            />
        );
    }

    return (
        <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg ${inverse ? 'bg-white text-[#F15F23]' : 'bg-[#F15F23] text-white shadow-[#F15F23]/25'}`}
        >
            <Sparkles className="h-6 w-6" />
        </div>
    );
};

export const SectionHeader = ({
    eyebrow,
    title,
    description,
    align = 'center',
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
}) => (
    <div
        className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
        {eyebrow && (
            <span className="inline-flex rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">
                {eyebrow}
            </span>
        )}
        <h2 className="mt-4 text-2xl font-black tracking-tight text-[#1E293B] sm:text-3xl md:text-5xl">
            {title}
        </h2>
        {description && (
            <p className="mt-4 text-base leading-8 text-[#64748B] md:text-lg">
                {description}
            </p>
        )}
    </div>
);

export const HeroSection = () => (
    <section className="relative overflow-hidden bg-[#F8FAFC] px-5 py-16 md:py-24 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-32 bg-white" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F15F23]/15 bg-white px-4 py-2 text-sm font-black text-[#F15F23] shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    Modern education for vibrant communities
                </span>
                <h1 className="mt-7 text-5xl leading-[1.02] font-black tracking-tight text-[#1E293B] md:text-7xl">
                    Belajar kreatif, tumbuh bersama, berdampak nyata.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#64748B]">
                    OMATIQ menghadirkan pengalaman belajar yang ramah, energik,
                    dan relevan untuk pelajar, mentor, sekolah, serta komunitas
                    yang ingin bergerak lebih jauh.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/olimpiade"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-xl shadow-[#F15F23]/25 transition hover:-translate-y-1 hover:bg-[#d94f18]"
                    >
                        Explore Olimpiade
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/about"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0F60AC]/15 bg-white px-6 py-4 text-sm font-black text-[#0F60AC] shadow-sm transition hover:-translate-y-1 hover:border-[#0F60AC]/30 hover:bg-[#0F60AC]/5"
                    >
                        Meet OMATIQ
                        <BookOpen className="h-4 w-4" />
                    </Link>
                </div>
                <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                    {[
                        ['12K+', 'Learners'],
                        ['48+', 'Olimpiade'],
                        ['120+', 'Communities'],
                    ].map(([value, label]) => (
                        <div
                            key={label}
                            className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100"
                        >
                            <p className="text-2xl font-black text-[#0F60AC]">
                                {value}
                            </p>
                            <p className="text-xs font-bold text-[#64748B]">
                                {label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative">
                <div className="absolute top-8 -left-5 z-10 hidden rotate-[-6deg] rounded-3xl bg-[#FFC857] px-5 py-4 font-black text-[#1E293B] shadow-xl md:block">
                    Project-based
                </div>
                <div className="absolute -right-4 bottom-16 z-10 hidden rotate-6 rounded-3xl bg-[#5DD39E] px-5 py-4 font-black text-white shadow-xl md:block">
                    Mentor circle
                </div>
                <div className="rounded-[40px] bg-white p-4 shadow-2xl ring-1 shadow-[#0F60AC]/10 ring-slate-100">
                    <div className="overflow-hidden rounded-[32px] bg-[#0F60AC]">
                        <img
                            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1300&q=80"
                            alt="Learners collaborating in a bright creative classroom"
                            className="h-[520px] w-full object-cover opacity-95 mix-blend-screen"
                        />
                    </div>
                </div>
                <div className="absolute right-6 -bottom-6 left-6 rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F15F23]/10 text-[#F15F23]">
                            <GraduationCap className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="font-black text-[#1E293B]">
                                Learning that feels alive
                            </p>
                            <p className="text-sm font-semibold text-[#64748B]">
                                Friendly modules, measurable growth, real
                                community momentum.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export const OlimpiadeCard = ({ olimpiade }: { olimpiade: OlimpiadeItem }) => (
    <Link
        href={`/olimpiade/${olimpiade.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#0F60AC]/10"
    >
        <div className="relative h-56 overflow-hidden">
            <img
                src={olimpiade.image}
                alt={olimpiade.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#0F60AC] backdrop-blur">
                {olimpiade.category}
            </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap gap-2 text-xs font-bold text-[#64748B]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-3 py-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {olimpiade.nextSchedule?.dateLabel ?? olimpiade.duration}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-3 py-1">
                    <Users className="h-3.5 w-3.5" />
                    {olimpiade.level}
                </span>
            </div>
            <h3 className="mt-4 text-xl font-black text-[#1E293B]">
                {olimpiade.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#64748B]">
                {olimpiade.description}
            </p>
            <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-[#F15F23] transition group-hover:gap-3">
                Learn More
                <ArrowRight className="h-4 w-4" />
            </span>
        </div>
    </Link>
);

export const NewsCard = ({
    article,
    featured = false,
}: {
    article: NewsItem;
    featured?: boolean;
}) => {
    const className = `group min-w-0 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#0F60AC]/10 sm:rounded-3xl ${
        featured
            ? 'grid md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]'
            : 'flex h-full flex-col'
    }`;
    const content = (
        <>
            <div
                className={`relative overflow-hidden ${featured ? 'h-56 sm:h-72 md:h-full md:min-h-80 lg:min-h-96' : 'h-52 sm:h-64'}`}
            >
                <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
            </div>
            <div
                className={`flex min-w-0 flex-1 flex-col ${featured ? 'p-5 sm:p-7 lg:p-10' : 'p-5 sm:p-6 md:p-7'}`}
            >
                <div className="flex min-w-0 flex-wrap items-center gap-3 text-xs font-black tracking-wide uppercase">
                    <span className="rounded-full bg-[#F15F23]/10 px-3 py-1 text-[#F15F23]">
                        {article.category}
                    </span>
                    <span className="text-[#64748B]">{article.date}</span>
                </div>
                <h3
                    className={`mt-4 min-w-0 leading-tight font-black break-words text-[#1E293B] ${
                        featured
                            ? 'text-2xl sm:text-3xl lg:text-4xl'
                            : 'text-xl sm:text-2xl'
                    }`}
                >
                    {article.title}
                </h3>
                <p
                    className={`${featured ? 'line-clamp-4 text-base leading-8' : 'line-clamp-3 text-sm leading-7'} mt-4 min-w-0 break-words text-[#64748B]`}
                >
                    {article.excerpt}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-[#0F60AC] transition group-hover:gap-3">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                </span>
            </div>
        </>
    );

    if (article.link) {
        return (
            <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
            >
                {content}
            </a>
        );
    }

    return (
        <Link href={`/berita/${article.slug}`} className={className}>
            {content}
        </Link>
    );
};

export const TestimonialCard = ({
    testimonial,
}: {
    testimonial: TestimonialItem;
}) => (
    <div className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl sm:p-6">
        <div className="flex gap-1 text-[#FFC857]">
            {Array.from({ length: testimonial.rating }).map((_, index) => (
                <Star
                    key={`${testimonial.id}-${index}`}
                    className="h-4 w-4 fill-current"
                />
            ))}
        </div>
        <p className="mt-5 flex-1 text-base leading-8 text-[#1E293B]">
            "{testimonial.quote}"
        </p>
        <div className="mt-6 flex items-center gap-4">
            <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="h-12 w-12 rounded-2xl object-cover"
            />
            <div>
                <p className="font-black text-[#1E293B]">{testimonial.name}</p>
                <p className="text-sm font-semibold text-[#64748B]">
                    {testimonial.role}
                </p>
            </div>
        </div>
    </div>
);

export const CTASection = ({
    title = 'Yuk daftarkan anak hebatmu ke OMATIQ!',
    description = "Beri anak kesempatan merasakan olimpiade nasional yang seru, terarah, dan membangun percaya diri melalui cabang Al-Qur'an dan Matematika.",
    primaryHref = '/kontak',
}: {
    title?: string;
    description?: string;
    primaryHref?: string;
}) => (
    <section className="px-5 py-14 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 shadow-[#F15F23]/15 ring-[#F15F23]/10 sm:rounded-[32px]">
            <div className="relative grid items-center gap-8 bg-gradient-to-br from-[#FFF7ED] via-white to-[#EAF6FF] p-5 sm:p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:p-12">
                <div className="absolute top-6 left-6 h-20 w-20 rounded-[28px] bg-[#FFC857]/30 blur-2xl" />
                <div className="absolute right-10 bottom-8 h-28 w-28 rounded-[36px] bg-[#56CCF2]/25 blur-3xl" />

                <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">
                        <Trophy className="h-4 w-4" />
                        Pendaftaran Olimpiade Dibuka
                    </span>
                    <h2 className="mt-5 max-w-3xl text-2xl font-black tracking-tight text-[#1E293B] sm:text-3xl md:text-5xl">
                        {title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-[#64748B] md:text-lg">
                        {description}
                    </p>

                    <div className="mt-7 grid gap-3 sm:grid-cols-3">
                        {[
                            {
                                icon: ClipboardCheck,
                                label: 'Pilih cabang lomba',
                            },
                            {
                                icon: CalendarDays,
                                label: 'Ikuti jadwal seleksi',
                            },
                            {
                                icon: CheckCircle2,
                                label: 'Siap tampil nasional',
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-3 rounded-2xl bg-white/85 p-3 text-sm font-black text-[#1E293B] shadow-sm ring-1 ring-slate-100 backdrop-blur"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F60AC]/10 text-[#0F60AC]">
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={primaryHref}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-xl shadow-[#F15F23]/25 transition hover:-translate-y-1 hover:bg-[#d94f18]"
                        >
                            Daftar Olimpiade
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/jadwal"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0F60AC]/15 bg-white px-6 py-4 text-sm font-black text-[#0F60AC] shadow-sm transition hover:-translate-y-1 hover:border-[#0F60AC]/30 hover:bg-[#0F60AC]/5"
                        >
                            Lihat Jadwal
                            <Calendar className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="relative z-10 mx-auto w-full max-w-xl">
                    <div className="absolute top-10 -left-10 z-10 hidden rotate-[-6deg] rounded-2xl bg-[#FFC857] px-4 py-3 text-sm font-black text-[#1E293B] shadow-xl sm:block">
                        Untuk anak Indonesia
                    </div>
                    <div className="absolute -right-2 bottom-12 z-10 hidden rotate-6 rounded-2xl bg-[#5DD39E] px-4 py-3 text-sm font-black text-white shadow-xl sm:block">
                        Seru & terarah
                    </div>
                    <img
                        src="/assets/images/child.png"
                        alt="Excited student celebrating success in a vibrant school hallway"
                        className="mx-auto h-auto max-h-96 w-full rounded-2xl object-contain lg:max-h-none"
                    />
                </div>
            </div>
        </div>
    </section>
);

export const ContactForm = () => {
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        window.setTimeout(() => {
            setSubmitting(false);
            toast.success(
                'Pesan kamu sudah tercatat. Tim OMATIQ akan menghubungi segera.',
            );
            event.currentTarget.reset();
        }, 700);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-6 shadow-xl ring-1 shadow-[#0F60AC]/10 ring-slate-100 md:p-8"
        >
            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    label="Name"
                    name="name"
                    placeholder="Nama lengkap"
                />
                <FormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="email@domain.com"
                />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormField
                    label="Phone"
                    name="phone"
                    placeholder="Nomor WhatsApp"
                />
                <FormField
                    label="Topic"
                    name="topic"
                    placeholder="Kolaborasi / Olimpiade"
                />
            </div>
            <label className="mt-4 block">
                <span className="text-sm font-black text-[#1E293B]">
                    Message
                </span>
                <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Ceritakan kebutuhan kamu..."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold transition outline-none focus:border-[#F15F23] focus:bg-white"
                />
            </label>
            <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F15F23] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#F15F23]/25 transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
            >
                {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
                Send Message
            </button>
        </form>
    );
};

const FormField = ({
    label,
    name,
    type = 'text',
    placeholder,
}: {
    label: string;
    name: string;
    type?: string;
    placeholder: string;
}) => (
    <label className="block">
        <span className="text-sm font-black text-[#1E293B]">{label}</span>
        <input
            name={name}
            type={type}
            required
            placeholder={placeholder}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold transition outline-none focus:border-[#F15F23] focus:bg-white"
        />
    </label>
);

export const EmptyState = ({
    title,
    description,
}: {
    title: string;
    description: string;
}) => (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <Search className="mx-auto h-10 w-10 text-[#0F60AC]" />
        <h3 className="mt-4 text-xl font-black text-[#1E293B]">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-[#64748B]">{description}</p>
    </div>
);

export const LoadingState = () => (
    <div className="flex min-h-56 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        <Loader2 className="h-6 w-6 animate-spin text-[#F15F23]" />
    </div>
);

export const FeatureIcon = ({
    icon: Icon,
    color = 'orange',
}: {
    icon: LucideIcon;
    color?: 'orange' | 'blue' | 'mint' | 'purple';
}) => {
    const colors = {
        orange: 'bg-[#F15F23]/10 text-[#F15F23]',
        blue: 'bg-[#0F60AC]/10 text-[#0F60AC]',
        mint: 'bg-[#5DD39E]/15 text-[#12885b]',
        purple: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    };

    return (
        <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]}`}
        >
            <Icon className="h-7 w-7" />
        </div>
    );
};

export const ContactInfoGrid = () => {
    const settings = getSettings();
    const items = useMemo(
        () => [
            {
                icon: MapPin,
                label: 'Address',
                value: settings.address || 'Jakarta, Indonesia',
            },
            {
                icon: Phone,
                label: 'Phone',
                value: settings.phone || '+62 812 0000 2026',
            },
            {
                icon: Mail,
                label: 'Email',
                value: settings.email || 'hello@omatiq.id',
            },
            {
                icon: MessageCircle,
                label: 'Community',
                value: 'Open for collaboration',
            },
        ],
        [settings.address, settings.email, settings.phone],
    );

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
                >
                    <FeatureIcon icon={item.icon} color="blue" />
                    <p className="mt-4 text-sm font-black tracking-wide text-[#64748B] uppercase">
                        {item.label}
                    </p>
                    <p className="mt-1 font-black text-[#1E293B]">
                        {item.value}
                    </p>
                </div>
            ))}
        </div>
    );
};
