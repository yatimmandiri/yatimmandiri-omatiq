import { cn } from '@/lib/utils';
import { InfoIcon } from 'lucide-react';
import { ChangeEvent } from 'react';

import { Field, FieldDescription, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

const variants: any = {
    default:
        'border-zinc-300 focus:border-blue-500 focus:ring-blue-500 focus-visible:ring-blue-500 focus-visible:shadow-blue-500/30',
    info: 'border-sky-300 focus:border-sky-500 focus:ring-sky-500 focus-visible:ring-sky-500 focus-visible:shadow-sky-500/30',
    success:
        'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 focus-visible:ring-emerald-500 focus-visible:shadow-emerald-500/30',
    warning:
        'border-amber-300 focus:border-amber-500 focus:ring-amber-500 focus-visible:ring-amber-500 focus-visible:shadow-amber-500/30',
    danger: 'border-red-300 focus:border-red-500 focus:ring-red-500 focus-visible:ring-red-500 focus-visible:shadow-red-500/30',
};

interface NumberComponentProps {
    label?: string;
    value?: string | number;
    placeholder?: string;
    className?: string;
    errors?: any;
    helperText?: string;
    color?: 'default' | 'info' | 'success' | 'warning' | 'danger';
    min?: number;
    max?: number;
    allowDecimal?: boolean;
    allowNegative?: boolean;
    handleOnChange?: (value: string) => void;
    [key: string]: any;
}

export const NumberComponent = ({
    label,
    value = '',
    placeholder = 'Input Number',
    className,
    errors,
    helperText,
    color = 'default',
    min,
    max,
    allowDecimal = false,
    allowNegative = false,
    handleOnChange,
    ...props
}: NumberComponentProps) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;

        // allow number only
        if (allowDecimal) {
            val = val.replace(allowNegative ? /[^0-9.-]/g : /[^0-9.]/g, '');

            // prevent multiple dots
            const parts = val.split('.');
            if (parts.length > 2) {
                val = `${parts[0]}.${parts.slice(1).join('')}`;
            }
        } else {
            val = val.replace(allowNegative ? /[^0-9-]/g : /[^0-9]/g, '');
        }

        // prevent multiple minus
        if (allowNegative) {
            const minusCount = (val.match(/-/g) || []).length;

            if (minusCount > 1) {
                val = val.replace(/-/g, '');
                val = `-${val}`;
            }

            // minus only at beginning
            val = val.replace(/(?!^)-/g, '');
        }

        // min max
        if (val !== '' && !isNaN(Number(val))) {
            const num = Number(val);

            if (min !== undefined && num < min) {
                val = String(min);
            }

            if (max !== undefined && num > max) {
                val = String(max);
            }
        }

        handleOnChange?.(val);
    };

    return (
        <Field data-invalid={errors}>
            {label && <FieldLabel>{label}</FieldLabel>}

            <Input
                type="text"
                inputMode="numeric"
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
                className={cn(
                    variants[color],
                    errors && 'border-red-500',
                    className,
                )}
                {...props}
            />

            {helperText && (
                <FieldDescription
                    className={cn(
                        'flex items-center gap-2',
                        errors ? 'text-destructive' : 'text-muted-foreground',
                    )}
                >
                    <InfoIcon className="h-4 w-4" />
                    <span>{helperText}</span>
                </FieldDescription>
            )}
        </Field>
    );
};
