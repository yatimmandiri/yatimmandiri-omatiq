import olimpiades from '@/routes/admin/companies/olimpiades';
import olimpiadeGalleries from '@/routes/admin/companies/olimpiade-galleries';
import olimpiadeObjectives from '@/routes/admin/companies/olimpiade-objectives';
import olimpiadeSchedules from '@/routes/admin/companies/olimpiade-schedules';
import olimpiadeVideos from '@/routes/admin/companies/olimpiade-videos';
import participants from '@/routes/admin/companies/participants';
import periods from '@/routes/admin/companies/periods';
import testimonials from '@/routes/admin/companies/testimonials';
import permissions from '@/routes/admin/core/permissions';
import districts from '@/routes/admin/core/regions/districts';
import provinces from '@/routes/admin/core/regions/provinces';
import regencies from '@/routes/admin/core/regions/regencies';
import villages from '@/routes/admin/core/regions/villages';
import roles from '@/routes/admin/core/roles';
import users from '@/routes/admin/core/users';
import activities from '@/routes/admin/logs/activities';
import site from '@/routes/admin/settings/site';
import {
    Building2,
    CalendarClock,
    CalendarDays,
    ClipboardCheck,
    CogIcon,
    CpuIcon,
    Database,
    GraduationCap,
    Handshake,
    HelpCircle,
    House,
    Image,
    Images,
    KeyRound,
    LayoutDashboard,
    Map,
    MapIcon,
    MapPin,
    Medal,
    Quote,
    ShieldCheck,
    SlidersHorizontal,
    Star,
    Target,
    Trophy,
    UserCheck,
    UserRound,
    Users,
    Video,
} from 'lucide-react';
import reviews from '@/routes/admin/companies/reviews';
import sliders from '@/routes/admin/companies/sliders';
import teachers from '@/routes/admin/companies/teachers';
import faqCompanies from '@/routes/admin/companies/faq-companies';
import dataPeserta from '@/routes/teacher/data-peserta';
import binaan from '@/routes/teacher/data-binaan';
import sanggar from '@/routes/teacher/data-sanggar';
import absensi from '@/routes/teacher/absensi';
import students from '@/routes/admin/companies/students';

export const NavigationList = [
    {
        title: 'Portal Guru',
        roles: ['Teacher'],
        icon: GraduationCap,
        children: [
            {
                title: 'Dashboard',
                href: '/teacher/dashboard',
                roles: ['Teacher'],
                icon: LayoutDashboard,
            },
            {
                title: 'Biodata',
                href: '/teacher/biodata',
                roles: ['Teacher'],
                icon: UserRound,
            },
            {
                title: 'Data Binaan',
                href: binaan.index().url,
                roles: ['Teacher'],
                icon: Users,
            },
            {
                title: 'Data Peserta',
                href: dataPeserta.index().url,
                roles: ['Teacher'],
                icon: GraduationCap,
            },
            {
                title: 'Data Sanggar',
                href: sanggar.index().url,
                roles: ['Teacher'],
                icon: Building2,
            },
            {
                title: 'Presensi & Jurnal',
                href: absensi.index().url,
                roles: ['Teacher'],
                icon: ClipboardCheck,
            },
        ],
    },
    {
        title: 'Partisipasi',
        roles: ['Administrators', 'Cabang', 'Keuangan'],
        icon: Handshake,
        children: [
            {
                title: 'Data Guru',
                href: teachers.index().url,
                permission: 'view-user',
                roles: ['Administrators', 'Cabang'],
                icon: UserCheck,
            },
            {
                title: 'Data Peserta',
                href: participants.index().url,
                permission: 'view-participant',
                roles: ['Administrators', 'Cabang', 'Keuangan'],
                icon: Users,
            },
            {
                title: 'Data Binaan',
                href: students.index().url,
                permission: 'view-student',
                roles: ['Administrators', 'Cabang'],
                icon: GraduationCap,
            },
            {
                title: 'Data Sanggar',
                href: '/admin/companies/sanggars',
                permission: 'view-participant',
                roles: ['Administrators', 'Cabang'],
                icon: Building2,
            },
        ],
    },
    {
        title: 'Platform',
        roles: ['Administrators'],
        children: [
            {
                title: 'Inti Sistem',
                roles: ['Administrators'],
                icon: CpuIcon,
                children: [
                    {
                        title: 'Perizinan',
                        href: permissions.index().url,
                        permission: 'view-permission',
                        icon: KeyRound,
                    },
                    {
                        title: 'Peran',
                        href: roles.index().url,
                        permission: 'view-role',
                        icon: ShieldCheck,
                    },
                    {
                        title: 'Pengguna',
                        href: users.index().url,
                        permission: 'view-user',
                        icon: Users,
                    },
                    {
                        title: 'Wilayah',
                        roles: ['Administrators'],
                        icon: MapIcon,
                        children: [
                            {
                                title: 'Provinsi',
                                href: provinces.index().url,
                                permission: 'view-province',
                                icon: Map,
                            },
                            {
                                title: 'Kabupaten/Kota',
                                href: regencies.index().url,
                                permission: 'view-regency',
                                icon: Building2,
                            },
                            {
                                title: 'Kecamatan',
                                href: districts.index().url,
                                permission: 'view-district',
                                icon: MapPin,
                            },
                            {
                                title: 'Desa/Kelurahan',
                                href: villages.index().url,
                                permission: 'view-village',
                                icon: House,
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Data & Konten',
                roles: ['Administrators'],
                icon: Trophy,
                children: [
                    {
                        title: 'Data Master',
                        roles: ['Administrators'],
                        icon: Database,
                        children: [
                            {
                                title: 'Periode',
                                href: periods.index().url,
                                permission: 'view-period',
                                icon: CalendarDays,
                            },
                            {
                                title: 'Olimpiade',
                                href: olimpiades.index().url,
                                permission: 'view-olimpiade',
                                icon: Medal,
                            },
                            {
                                title: 'Tujuan',
                                href: olimpiadeObjectives.index().url,
                                permission: 'view-olimpiade-objective',
                                icon: Target,
                            },
                            {
                                title: 'Jadwal Olimpiade',
                                href: olimpiadeSchedules.index().url,
                                permission: 'view-olimpiade-schedule',
                                icon: CalendarClock,
                            },
                        ],
                    },
                    {
                        title: 'Konten & Media',
                        roles: ['Administrators'],
                        icon: Images,
                        children: [
                            {
                                title: 'Galeri',
                                href: olimpiadeGalleries.index().url,
                                permission: 'view-olimpiade-gallery',
                                icon: Image,
                            },
                            {
                                title: 'Video',
                                href: olimpiadeVideos.index().url,
                                permission: 'view-olimpiade-video',
                                icon: Video,
                            },
                            {
                                title: 'Slider',
                                href: sliders.index().url,
                                permission: 'view-slider',
                                icon: SlidersHorizontal,
                            },
                            {
                                title: 'Testimoni',
                                href: testimonials.index().url,
                                permission: 'view-testimonial',
                                icon: Quote,
                            },
                            {
                                title: 'Ulasan',
                                href: reviews.index().url,
                                permission: 'view-review',
                                icon: Star,
                            },
                            {
                                title: 'FAQ',
                                href: faqCompanies.index().url,
                                permission: 'view-faq-company',
                                icon: HelpCircle,
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Pengaturan',
                roles: ['Administrators'],
                icon: CogIcon,
                children: [
                    {
                        title: 'Situs',
                        href: site.edit().url,
                        permission: 'view-settings-site',
                        icon: House,
                    },
                    {
                        title: 'Log Aktivitas',
                        href: activities.index().url,
                        permission: 'view-log-activity',
                        icon: ClipboardCheck,
                    },
                ],
            },
        ],
    },
];
