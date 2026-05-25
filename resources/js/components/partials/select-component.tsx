import { cn } from '@/lib/utils';
import axios from 'axios';
import { Check, ChevronsUpDown, InfoIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../ui/command';
import { Field, FieldDescription, FieldLabel } from '../ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

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

interface SelectComponentProps {
    placeholder?: string;
    data?: any;
    dataSelected?: any;
    label?: string;
    errors?: any;
    helperText?: any;
    multiple?: boolean;
    handleOnChange?: any;
    fetchDataUrl?: string;
    color?: 'default' | 'info' | 'success' | 'warning' | 'danger';
    [key: string]: any;
}

export const SelectComponent = ({
    placeholder = 'Select option...',
    data,
    dataSelected,
    label,
    errors,
    helperText,
    multiple,
    handleOnChange,
    fetchDataUrl,
    color = 'default',
    ...props
}: SelectComponentProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [resultData, setResultData] = useState(data ?? []);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!fetchDataUrl) {
            setResultData(data ?? []);
        }
    }, [data, fetchDataUrl]);

    const isSelected = (value: string) => {
        return Array.isArray(dataSelected)
            ? dataSelected.includes(value)
            : dataSelected === value;
    };

    const toggleSelect = (value: any) => {
        if (multiple) {
            const selectedArray = Array.isArray(dataSelected)
                ? [...dataSelected]
                : [];

            const index = selectedArray.indexOf(value);

            if (index >= 0) {
                selectedArray.splice(index, 1);
            } else {
                selectedArray.push(value);
            }

            handleOnChange(selectedArray);
        } else {
            handleOnChange(value);
            setOpen(false);
        }
    };

    const renderPlaceholder = useMemo(() => {
        if (multiple) {
            const selectedLabels = resultData
                .filter((item: any) =>
                    Array.isArray(dataSelected)
                        ? dataSelected.includes(item.value)
                        : false,
                )
                .map((item: any) => item.label);

            return selectedLabels.length > 0
                ? selectedLabels.join(', ')
                : placeholder;
        } else {
            const selectedLabel = resultData.find(
                (item: any) => item.value === dataSelected,
            )?.label;

            return selectedLabel || placeholder;
        }
    }, [dataSelected, resultData, multiple, placeholder]);

    // ✅ fetch data (API mode)
    const fetchData = useCallback(async () => {
        if (!fetchDataUrl) return;

        if (searchValue.length < 3) return;

        setIsLoading(true);

        try {
            const response = await axios.get(fetchDataUrl, {
                params: {
                    globalSearch: searchValue,
                },
            });

            const mapped =
                response.data?.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                })) ?? [];

            setResultData(mapped.slice(0, 10));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchDataUrl, searchValue]);

    useEffect(() => {
        if (!fetchDataUrl) return;

        const delay = setTimeout(() => {
            fetchData();
        }, 500);

        return () => clearTimeout(delay);
    }, [fetchData, fetchDataUrl]);

    return (
        <Field>
            {/* LABEL */}
            <div className="flex flex-row items-center justify-between">
                {label && <FieldLabel htmlFor={label}>{label}</FieldLabel>}
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            'relative w-full justify-between',
                            variants[color],
                        )}
                    >
                        <span
                            className={
                                !dataSelected ||
                                (Array.isArray(dataSelected) &&
                                    dataSelected.length === 0)
                                    ? 'text-gray-500'
                                    : ''
                            }
                        >
                            {renderPlaceholder}
                        </span>
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search..."
                            className="h-9"
                            onValueChange={(value: any) =>
                                setSearchValue(value)
                            }
                        />
                        <CommandList>
                            {isLoading && (
                                <div className="p-2 text-center text-sm text-gray-500">
                                    Loading...
                                </div>
                            )}

                            {!isLoading && resultData.length === 0 && (
                                <CommandEmpty>No results found.</CommandEmpty>
                            )}
                            <CommandGroup>
                                <CommandItem onSelect={() => toggleSelect('')}>
                                    Clear Selection
                                </CommandItem>
                                {resultData.map((item: any, i: number) => (
                                    <CommandItem
                                        key={i}
                                        value={item.label}
                                        onSelect={() =>
                                            toggleSelect(item.value)
                                        }
                                    >
                                        {item.label}
                                        <Check
                                            className={`ml-auto h-4 w-4 ${
                                                isSelected(item.value)
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            }`}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* HELPER */}
            {helperText && (
                <FieldDescription
                    className={`flex items-center space-x-2 ${
                        errors ? 'text-destructive' : 'text-yellow-500'
                    }`}
                >
                    <InfoIcon className="h-4 w-4" />
                    <span>{helperText}</span>
                </FieldDescription>
            )}
        </Field>
    );
};
