import type { LucideIcon } from 'lucide-react';
import { Info, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'info' | 'warning';

const tones: Record<Tone, string> = {
    success:
        'border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300',
    info: 'border-sky-200 bg-sky-50/80 text-sky-900 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-300',
    warning:
        'border-amber-200/80 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300',
};

const icons: Record<Tone, LucideIcon> = {
    success: ShieldCheck,
    info: Info,
    warning: Info,
};

export default function AuthCallout({
    tone = 'success',
    title,
    children,
}: {
    tone?: Tone;
    title?: string;
    children: React.ReactNode;
}) {
    const Icon = icons[tone];

    return (
        <div
            role="status"
            className={cn(
                'mb-5 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed',
                tones[tone],
            )}
        >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
                {title && <p className="text-sm font-semibold">{title}</p>}
                <div>{children}</div>
            </div>
        </div>
    );
}
