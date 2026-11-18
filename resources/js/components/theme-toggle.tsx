import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const isDark = resolvedAppearance === 'dark';

    const handleToggle = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className={cn(
                'size-9 shrink-0 text-muted-foreground hover:text-foreground',
                className,
            )}
            aria-label={
                isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'
            }
            title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
        >
            <Sun className="size-4 scale-100 rotate-0 text-amber-500 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 text-emerald-400 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle tema tampilan</span>
        </Button>
    );
}
