import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export default function GoogleButton({
    href,
    label,
}: {
    href: string;
    label: string;
}) {
    return (
        <Button
            asChild
            type="button"
            variant="outline"
            className="h-11 w-full border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
            <a
                href={href}
                className="flex w-full items-center justify-center gap-2.5"
            >
                <FcGoogle className="size-5 shrink-0" />
                <span>{label}</span>
            </a>
        </Button>
    );
}
