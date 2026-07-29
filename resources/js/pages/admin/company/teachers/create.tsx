import { ButtonComponent } from '@/components/partials/button-component';
import { InputTextComponent } from '@/components/partials/input-component';
import teachers from '@/routes/admin/companies/teachers';
import { Fieldset } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { EyeClosedIcon, EyeIcon, SaveIcon } from 'lucide-react';
import { useState } from 'react';

export default function CreatePage() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(teachers.store().url, {});
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="relative min-h-screen flex-1 flex-col space-y-8 overflow-hidden rounded-xl border border-sidebar-border/70 py-4 md:min-h-min md:py-6 dark:border-sidebar-border">
                <div className="px-4 md:px-6">
                    <Fieldset
                        as="form"
                        onSubmit={handleSubmit}
                        className="flex flex-col space-y-4"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputTextComponent
                                type="text"
                                label="Nama Guru"
                                placeholder="Nama lengkap"
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
                                label="Konfirmasi Password"
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
                        </div>
                        <div className="flex justify-end space-x-4">
                            <ButtonComponent
                                buttonText="Simpan"
                                addonLeft={SaveIcon}
                                buttonType="submit"
                                isProcessing={processing}
                            />
                        </div>
                    </Fieldset>
                </div>
            </div>
        </div>
    );
}
