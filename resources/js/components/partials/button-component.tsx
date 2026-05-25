import { cn } from '@/lib/utils';
import { createElement } from 'react';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

const variants: any = {
    solid: {
        default:
            'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900',
        info: 'bg-sky-600 text-white hover:bg-sky-700',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700',
        warning: 'bg-amber-500 text-black hover:bg-amber-600',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    },
    outline: {
        default:
            'border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100',
        info: 'border border-sky-600 bg-transparent text-sky-600 hover:bg-sky-50',
        success:
            'border border-emerald-600 bg-transparent text-emerald-600 hover:bg-emerald-50',
        warning:
            'border border-amber-500 bg-transparent text-amber-600 hover:bg-amber-50',
        danger: 'border border-red-600 bg-transparent text-red-600 hover:bg-red-50',
    },
    ghost: {
        default: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800',
        info: 'bg-transparent text-sky-600 hover:bg-sky-50',
        success: 'bg-transparent text-emerald-600 hover:bg-emerald-50',
        warning: 'bg-transparent text-amber-600 hover:bg-amber-50',
        danger: 'bg-transparent text-red-600 hover:bg-red-50',
    },
    link: {
        default: 'bg-transparent underline-offset-4 hover:underline',
        info: 'bg-transparent text-sky-600 hover:underline',
        success: 'bg-transparent text-emerald-600 hover:underline',
        warning: 'bg-transparent text-amber-600 hover:underline',
        danger: 'bg-transparent text-red-600 hover:underline',
    },
};

interface ButtonProps {
    buttonText?: string;
    className?: string;
    buttonType?: 'button' | 'submit' | 'reset';
    isProcessing?: boolean;
    addonLeft?: any;
    addonRight?: any;
    variant?: 'solid' | 'outline' | 'ghost' | 'link';
    color?: 'default' | 'info' | 'success' | 'warning' | 'danger';
    icons?: any;
    iconsClass?: string;
    pill?: boolean;
    [key: string]: any;
}

export const ButtonComponent = ({
    buttonType = 'button',
    buttonText = 'Button',
    variant = 'solid',
    color = 'default',
    className = '',
    isProcessing = false,
    addonLeft,
    addonRight,
    ...props
}: ButtonProps) => {
    return (
        <Button
            type={buttonType}
            disabled={isProcessing}
            className={cn(className, variants[variant][color])}
            {...props}
        >
            {addonLeft && createElement(addonLeft, { className: 'w-5 h-5' })}
            <span>{buttonText}</span>
            {addonRight && createElement(addonRight, { className: 'w-5 h-5' })}
            {isProcessing && <Spinner className="animate-spin" />}
        </Button>
    );
};

export const ButtonIconComponent = ({
    buttonType = 'button',
    icons = 'Button',
    className = '',
    iconsClass = 'w-5 h-5',
    variant = 'solid',
    color = 'default',
    pill = false,
    ...props
}: ButtonProps) => {
    return (
        <Button
            type={buttonType}
            className={cn(className, variants[variant][color])}
            {...props}
        >
            {icons && createElement(icons, { className: cn(iconsClass) })}
        </Button>
    );
};
