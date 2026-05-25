import { cn } from '@/lib/utils';
import { InfoIcon } from 'lucide-react';
import { Field, FieldDescription, FieldLabel } from '../ui/field';
import { Textarea } from '../ui/textarea';

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

interface TexareaComponentProps {
    placeholder?: string;
    label?: string;
    className?: string;
    handleOnChange?: (e: any) => void;
    group?: boolean;
    errors?: any;
    helperText?: any;
    color?: 'default' | 'info' | 'success' | 'warning' | 'danger';
    [key: string]: any;
}

export const TextAreaComponent = ({
    placeholder = 'Placeholder',
    className = '',
    label,
    errors,
    helperText,
    color = 'default',
    handleOnChange = () => {},
    ...props
}: TexareaComponentProps) => {
    return (
        <Field data-invalid={errors}>
            {label && <FieldLabel htmlFor={label}>{label}</FieldLabel>}
            <Textarea
                rows={30}
                cols={10}
                placeholder={placeholder}
                className={cn(className, variants[color])}
                onChange={(e) => handleOnChange(e.target.value)}
                {...props}
            />
            {helperText && (
                <FieldDescription
                    className={cn(
                        'flex items-center space-x-2',
                        errors ? 'text-red-500' : 'text-yellow-500',
                    )}
                >
                    <InfoIcon
                        className={cn(
                            'h-4 w-4',
                            errors ? 'text-red-500' : 'text-yellow-500',
                        )}
                    />
                    <span>{helperText}</span>
                </FieldDescription>
            )}
        </Field>
    );
};
