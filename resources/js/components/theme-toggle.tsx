import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    const Icon =
        appearance === 'dark' ? Moon : appearance === 'light' ? Sun : Monitor;

    const options = [
        { value: 'light' as const, label: 'Terang', icon: Sun },
        { value: 'dark' as const, label: 'Gelap', icon: Moon },
        { value: 'system' as const, label: 'Sistem', icon: Monitor },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('size-9 shrink-0', className)}
                    aria-label="Ubah tema tampilan"
                    title="Ubah tema tampilan"
                >
                    <Icon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => updateAppearance(option.value)}
                        className="cursor-pointer"
                    >
                        <option.icon className="mr-2 size-4" />
                        <span className="flex-1">{option.label}</span>
                        {appearance === option.value && (
                            <Check className="size-4 text-[#17524A] dark:text-emerald-400" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
