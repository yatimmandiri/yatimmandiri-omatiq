import { ButtonComponent } from '@/components/partials/button-component';
import { InputTextComponent } from '@/components/partials/input-component';
import { SelectComponent } from '@/components/partials/select-component';
import regencies from '@/routes/admin/core/regions/regencies';
import { Fieldset } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { SaveIcon } from 'lucide-react';

export const RegencyForm = ({ dataId }: { dataId?: string }) => {
    const { regency, provinces } = usePage<any>().props;

    const { data, setData, post, put, processing, errors, transform } = useForm(
        {
            saveBack: 'false',
            name: regency?.name || '',
            province_id: regency?.province?.id || '',
        },
    );

    // transformData
    transform((data: any) => ({
        ...data,
        ...(dataId && { _method: 'put' }),
    }));

    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (dataId) {
            put(regencies.update(dataId).url, {});
        } else {
            post(regencies.store().url, {});
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
                    label="Provinces"
                    placeholder="Select Province..."
                    data={provinces?.map((item: any) => {
                        return { label: item.name, value: item.id };
                    })}
                    dataSelected={data?.province_id}
                    onChange={(value: string) => setData('province_id', value)}
                    color={errors.province_id ? 'danger' : 'default'}
                    errors={errors.province_id && errors.province_id}
                    helperText={errors.province_id && errors.province_id}
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
