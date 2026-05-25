import { ButtonComponent } from '@/components/partials/button-component';
import { InputTextComponent } from '@/components/partials/input-component';
import { SelectComponent } from '@/components/partials/select-component';
import users from '@/routes/admin/core/users';
import { Fieldset } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { EyeClosedIcon, EyeIcon, SaveIcon } from 'lucide-react';
import { useState } from 'react';

export const UserForm = ({ dataId }: { dataId?: number }) => {
    const { user, roles } = usePage<any>().props;

    const { data, setData, post, put, processing, errors, transform } = useForm(
        {
            saveBack: 'false',
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            password_confirmation: '',
            role: user?.roles[0]?.id || '',
        },
    );

    // transformData
    transform((data: any) => ({
        ...data,
        role: roles?.filter((role: any) => role?.id === parseInt(data?.role))[0]
            ?.name,
        ...(dataId && { _method: 'put' }),
    }));

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (dataId) {
            put(users.update(dataId).url, {});
        } else {
            post(users.store().url, {});
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
                <InputTextComponent
                    type="email"
                    label="Email"
                    placeholder="Email"
                    name="email"
                    value={data.email}
                    handleOnChange={(value: string) => setData('email', value)}
                    color={errors.email ? 'danger' : 'default'}
                    errors={errors.email && errors.email}
                    helperText={errors.email && errors.email}
                />
                <InputTextComponent
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Password"
                    name="password"
                    value={data.password}
                    addonRight={showPassword ? EyeClosedIcon : EyeIcon}
                    handleRightAddon={() => setShowPassword(!showPassword)}
                    handleOnChange={(value: string) =>
                        setData('password', value)
                    }
                    color={errors.password ? 'danger' : 'default'}
                    errors={errors.password && errors.password}
                    helperText={errors.password && errors.password}
                    group={true}
                />
                <InputTextComponent
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    label="Password Confirmation"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    addonRight={
                        showPasswordConfirmation ? EyeClosedIcon : EyeIcon
                    }
                    handleRightAddon={() =>
                        setShowPasswordConfirmation(!showPasswordConfirmation)
                    }
                    handleOnChange={(value: string) =>
                        setData('password_confirmation', value)
                    }
                    color={errors.password_confirmation ? 'danger' : 'default'}
                    errors={
                        errors.password_confirmation &&
                        errors.password_confirmation
                    }
                    helperText={
                        errors.password_confirmation &&
                        errors.password_confirmation
                    }
                    group={true}
                />
                <SelectComponent
                    label="Role"
                    data={roles.map((role: any) => ({
                        value: role.id,
                        label: role.name,
                    }))}
                    dataSelected={data.role}
                    handleOnChange={(value: any) => setData('role', value)}
                    errors={errors.role && errors.role}
                    helperText={errors.role && errors.role}
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
