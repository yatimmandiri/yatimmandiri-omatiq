import { cn } from '@/lib/utils';
import { ChevronDownIcon, InfoIcon } from 'lucide-react';
import moment from 'moment-timezone';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Field, FieldDescription, FieldLabel } from '../ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const variants: any = {
    default: 'border-zinc-300 focus:border-blue-500 focus:ring-blue-500',
    info: 'border-sky-300 focus:border-sky-500',
    success: 'border-emerald-300 focus:border-emerald-500',
    warning: 'border-amber-300 focus:border-amber-500',
    danger: 'border-red-300 focus:border-red-500',
};

interface Props {
    placeholder?: string;
    className?: string;
    value?: any;
    label?: string;
    errors?: any;
    helperText?: string;
    group?: boolean;
    color?: keyof typeof variants;
    handleOnChange?: (val: any) => void;
    [key: string]: any;
}

export const DatePickerComponent = ({
    placeholder = 'Select Date',
    className = '',
    value,
    label,
    errors,
    helperText,
    group = false,
    color = 'default',
    handleOnChange = () => {},
}: Props) => {
    const [open, setOpen] = useState(false);

    const [internalDate, setInternalDate] = useState<Date | undefined>();
    const [internalRange, setInternalRange] = useState<any>();

    // CLEAN CONTROLLED VALUE
    const selectedDate = group ? null : (value ?? internalDate);
    const selectedRange = group ? (value ?? internalRange) : null;

    const handleSelect = (val: any) => {
        if (group) {
            setInternalRange(val);
            handleOnChange(val);

            if (val?.from && val?.to) {
                setOpen(false);
            }
        } else {
            setInternalDate(val);
            handleOnChange(val);
            setOpen(false);
        }
    };

    const formatted = useMemo(() => {
        if (group) {
            if (!selectedRange?.from) return placeholder;

            const from = moment(selectedRange.from)
                .tz('Asia/Jakarta')
                .format('DD MMM YYYY');

            if (selectedRange.to) {
                const to = moment(selectedRange.to)
                    .tz('Asia/Jakarta')
                    .format('DD MMM YYYY');

                return `${from} - ${to}`;
            }

            return from;
        }

        if (!selectedDate) return placeholder;

        return moment(selectedDate).tz('Asia/Jakarta').format('DD MMM YYYY');
    }, [group, selectedDate, selectedRange, placeholder]);

    // SAFE SYNC
    useEffect(() => {
        if (!value) return;

        if (group) {
            if (value?.from) setInternalRange(value);
        } else {
            setInternalDate(value);
        }
    }, [value, group]);

    return (
        <Field data-invalid={errors}>
            {label && <FieldLabel>{label}</FieldLabel>}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-full justify-between font-normal',
                            !selectedDate &&
                                !selectedRange &&
                                'text-muted-foreground',
                            variants[color],
                            className,
                        )}
                    >
                        {formatted}
                        <ChevronDownIcon className="h-4 w-4 opacity-60" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-auto p-0">
                    {group ? (
                        <Calendar
                            mode="range"
                            selected={selectedRange}
                            onSelect={handleSelect}
                            numberOfMonths={2}
                        />
                    ) : (
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleSelect}
                        />
                    )}
                </PopoverContent>
            </Popover>

            {helperText && (
                <FieldDescription
                    className={cn(
                        'flex items-center space-x-2',
                        errors ? 'text-destructive' : 'text-yellow-500',
                    )}
                >
                    <InfoIcon className="h-4 w-4" />
                    <span>{helperText}</span>
                </FieldDescription>
            )}
        </Field>
    );
};
