import { cn } from '@/lib/utils';

import { Checkbox } from '../ui/checkbox';
import { Field, FieldLabel } from '../ui/field';

const variants: Record<
    'default' | 'info' | 'success' | 'warning' | 'danger',
    string
> = {
    default:
        'border-zinc-300 data-[state=checked]:border-zinc-900 data-[state=checked]:bg-zinc-900 text-white',
    info: 'border-sky-300 data-[state=checked]:border-sky-600 data-[state=checked]:bg-sky-600 text-white',
    success:
        'border-emerald-300 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600 text-white',
    warning:
        'border-amber-300 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500 text-black',
    danger: 'border-red-300 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 text-white',
};

interface CheckboxComponentProps {
    checked: boolean;
    setChecked?: (checked: boolean) => void;
    label?: string;
    color?: 'default' | 'info' | 'success' | 'warning' | 'danger';
    orientation?: 'horizontal' | 'vertical' | 'responsive';
    className?: string;
    disabled?: boolean;
    [key: string]: any;
}

export const CheckboxComponent = ({
    checked,
    setChecked,
    label,
    color = 'default',
    orientation = 'horizontal',
    className,
    disabled = false,
}: CheckboxComponentProps) => {
    return (
        <Field orientation={orientation} className={cn('gap-2', className)}>
            <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value: boolean) =>
                    setChecked?.(value === true)
                }
                className={cn('transition-all duration-200', variants[color])}
            />
            {label && (
                <FieldLabel
                    className={cn(
                        'cursor-pointer text-sm',
                        disabled && 'cursor-not-allowed opacity-50',
                    )}
                >
                    {label}
                </FieldLabel>
            )}
        </Field>
    );
};
