import { ButtonComponent } from '@/components/partials/button-component';
import { InputTextComponent } from '@/components/partials/input-component';
import { SelectComponent } from '@/components/partials/select-component';
import villages from '@/routes/admin/core/regions/villages';
import { Fieldset } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { SaveIcon } from 'lucide-react';

export const VillageForm = ({ dataId }: { dataId?: string }) => {
    const { village, districts } = usePage<any>().props;

    const { data, setData, post, put, processing, errors, transform } = useForm(
        {
            saveBack: 'false',
            name: village?.name || '',
            district_id: village?.district?.id || '',
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
            put(villages.update(dataId).url, {});
        } else {
            post(villages.store().url, {});
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
                    label="District"
                    placeholder="Select District..."
                    data={districts?.map((item: any) => {
                        return { label: item.name, value: item.id };
                    })}
                    dataSelected={data?.district_id}
                    handleOnChange={(value: string) =>
                        setData('district_id', value)
                    }
                    color={errors.district_id ? 'danger' : 'default'}
                    errors={errors.district_id && errors.district_id}
                    helperText={errors.district_id && errors.district_id}
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
