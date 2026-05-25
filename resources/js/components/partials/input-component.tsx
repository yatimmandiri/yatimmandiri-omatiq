import { cn } from '@/lib/utils';
import { InfoIcon } from 'lucide-react';
import { createElement } from 'react';
import { Field, FieldDescription, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '../ui/input-group';

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

interface InputTextComponentProps {
    type?: string;
    placeholder?: string;
    label?: string;
    className?: string;
    addonLeft?: any;
    addonRight?: any;
    handleaddonLeft?: (e: any) => void;
    handleRightAddon?: (e: any) => void;
    handleOnChange?: (e: any) => void;
    group?: boolean;
    errors?: any;
    helperText?: any;
    color?: 'default' | 'info' | 'success' | 'warning' | 'danger';
    [key: string]: any;
}

export const InputTextComponent = ({
    type = 'text',
    placeholder = 'Placeholder',
    className = '',
    label,
    errors,
    helperText,
    group = false,
    addonLeft = false,
    addonRight = false,
    color = 'default',
    handleaddonLeft = () => {},
    handleRightAddon = () => {},
    handleOnChange = () => {},
    ...props
}: InputTextComponentProps) => {
    return (
        <Field data-invalid={errors}>
            {label && <FieldLabel htmlFor={label}>{label}</FieldLabel>}
            {group ? (
                <InputGroup>
                    {addonLeft && (
                        <InputGroupAddon align="inline-start">
                            {createElement(addonLeft, {
                                onClick: handleaddonLeft,
                                className: 'w-5 h-5 cursor-pointer',
                            })}
                        </InputGroupAddon>
                    )}
                    <InputGroupInput
                        type={type}
                        placeholder={placeholder}
                        className={cn(variants[color], className)}
                        onChange={(e) => handleOnChange(e.target.value)}
                        {...props}
                    />
                    {addonRight && (
                        <InputGroupAddon align="inline-end">
                            {createElement(addonRight, {
                                onClick: handleRightAddon,
                                className: 'w-5 h-5 cursor-pointer',
                            })}
                        </InputGroupAddon>
                    )}
                </InputGroup>
            ) : (
                <Input
                    type={type}
                    placeholder={placeholder}
                    className={cn(className, variants[color])}
                    onChange={(e) => handleOnChange(e.target.value)}
                    {...props}
                />
            )}
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

export const InputFileComponent = ({
    placeholder = 'Placeholder',
    className = '',
    label,
    errors,
    helperText,
    group = false,
    addonLeft = false,
    addonRight = false,
    color = 'default',
    handleaddonLeft = () => {},
    handleRightAddon = () => {},
    handleOnChange = () => {},
    ...props
}: InputTextComponentProps) => {
    return (
        <Field>
            {label && <FieldLabel htmlFor={label}>{label}</FieldLabel>}
            <Input
                type="file"
                placeholder={placeholder}
                className={cn(variants[color], className)}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleOnChange?.(file);
                }}
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
