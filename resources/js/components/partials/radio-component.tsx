import { cn } from '@/lib/utils';
import { Field, FieldDescription, FieldLabel } from '../ui/field';

const variants: any = {
    default: 'border-zinc-300 focus:ring-blue-500 text-blue-500',
    info: 'border-sky-300 focus:ring-sky-500 text-sky-500',
    success: 'border-emerald-300 focus:ring-emerald-500 text-emerald-500',
    warning: 'border-amber-300 focus:ring-amber-500 text-amber-500',
    danger: 'border-red-300 focus:ring-red-500 text-red-500',
};

interface Option {
    label: string;
    value: string | number;
    disabled?: boolean;
}

interface RadioComponentProps {
    label?: string;
    value?: string | number;
    options: Option[];
    name: string;
    errors?: any;
    helperText?: string;
    className?: string;
    color?: keyof typeof variants;
    onChange?: (value: string | number) => void;
}

export const RadioComponent = ({
    label,
    value,
    options = [],
    name,
    errors,
    helperText,
    className,
    color = 'default',
    onChange,
}: RadioComponentProps) => {
    return (
        <Field data-invalid={errors}>
            {label && <FieldLabel>{label}</FieldLabel>}

            <div className={cn('flex flex-col gap-2', className)}>
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            'flex cursor-pointer items-center gap-2 text-sm',
                            option.disabled && 'cursor-not-allowed opacity-50',
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            disabled={option.disabled}
                            onChange={() => onChange?.(option.value)}
                            className={cn(
                                'h-4 w-4 border-gray-300 focus:ring-2',
                                variants[color],
                                errors && 'border-red-500',
                            )}
                        />

                        <span className="text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>

            {helperText && (
                <FieldDescription
                    className={cn(
                        'flex items-center gap-2',
                        errors ? 'text-destructive' : 'text-muted-foreground',
                    )}
                >
                    {helperText}
                </FieldDescription>
            )}
        </Field>
    );
};
