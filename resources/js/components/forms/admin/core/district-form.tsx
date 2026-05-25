import { ButtonComponent } from '@/components/partials/button-component';
import { InputTextComponent } from '@/components/partials/input-component';
import { SelectComponent } from '@/components/partials/select-component';
import districts from '@/routes/admin/core/regions/districts';
import { Fieldset } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { SaveIcon } from 'lucide-react';
import { FormEvent } from 'react';
import { toast } from 'sonner';

export const DistrictForm = ({ dataId }: { dataId?: string }) => {
    const { district, regencies } = usePage<any>().props;

    const { data, setData, post, put, processing, errors, reset, transform } =
        useForm({
            saveBack: 'false',
            name: district?.name || '',
            regency_id: district?.regency?.id || '',
        });

    // transformData
    transform((data: any) => ({
        ...data,
        ...(dataId && { _method: 'put' }),
    }));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (dataId) {
            put(districts.update(dataId).url, {});
        } else {
            post(districts.store().url, {
                onSuccess: () => {
                    reset(); // reset form
                },
                onError: () => {
                    toast.error('Terjadi kesalahan saat menambahkan district');
                },
            });
        }
    };

    return (
        <Fieldset
            as="form"
            onSubmit={handleSubmit}
            className="flex flex-col space-y-4"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputTextComponent
                    type="text"
                    label="Name"
                    placeholder="Name"
                    name="name"
                    value={data.name}
                    handleOnChange={(value: string) => setData('name', value)}
                    color={errors.name ? 'danger' : 'default'}
                    errors={errors.name && errors.name}
                    helperText={errors.name && errors.name}
                />
                <SelectComponent
                    label="Regencies"
                    placeholder="Select Regencies..."
                    data={regencies?.map((item: any) => {
                        return { label: item.name, value: item.id };
                    })}
                    dataSelected={data?.regency_id}
                    handleOnChange={(value: string) =>
                        setData('regency_id', value)
                    }
                    color={errors.regency_id ? 'danger' : 'default'}
                    errors={errors.regency_id && errors.regency_id}
                    helperText={errors.regency_id && errors.regency_id}
                />
            </div>
            <div className="flex justify-end space-x-4">
                <ButtonComponent
                    buttonText="Save"
                    addonLeft={SaveIcon}
                    buttonType="submit"
                    isProcessing={processing}
                    onClick={() => setData('saveBack', 'true')}
                />
            </div>
        </Fieldset>
    );
};
