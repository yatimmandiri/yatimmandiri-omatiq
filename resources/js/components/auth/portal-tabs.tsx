import { Link } from '@inertiajs/react';
import { GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type Portal = 'peserta' | 'guru' | 'admin';

const tabs: {
    id: Portal;
    label: string;
    shortLabel: string;
    href: string;
    icon: typeof UserCheck;
}[] = [
    {
        id: 'peserta',
        label: 'Peserta',
        shortLabel: 'Peserta',
        href: '/login',
        icon: UserCheck,
    },
    {
        id: 'guru',
        label: 'Guru Pembina',
        shortLabel: 'Guru',
        href: '/teacher/login',
        icon: GraduationCap,
    },
    {
        id: 'admin',
        label: 'Admin',
        shortLabel: 'Admin',
        href: '/admin/login',
        icon: ShieldCheck,
    },
];

export default function PortalTabs({ active }: { active: Portal }) {
    return (
        <div
            role="tablist"
            aria-label="Pilih portal masuk"
            className="mb-6 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        >
            {tabs.map((tab) => {
                const isActive = tab.id === active;
                const Icon = tab.icon;
                const className = cn(
                    'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition',
                    isActive
                        ? 'bg-white font-semibold text-[#17524A] shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                        : 'font-medium text-slate-600 hover:text-[#17524A] dark:text-slate-400 dark:hover:text-emerald-300',
                );

                if (isActive) {
                    return (
                        <div
                            key={tab.id}
                            role="tab"
                            aria-selected="true"
                            className={className}
                        >
                            <Icon className="size-3.5 shrink-0" />
                            <span className="hidden sm:inline">
                                {tab.label}
                            </span>
                            <span className="sm:hidden">{tab.shortLabel}</span>
                        </div>
                    );
                }

                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        role="tab"
                        aria-selected="false"
                        className={className}
                    >
                        <Icon className="size-3.5 shrink-0" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.shortLabel}</span>
                    </Link>
                );
            })}
        </div>
    );
}
