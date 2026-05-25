import { ButtonComponent } from '@/components/partials/button-component';
import { CheckboxComponent } from '@/components/partials/checkbox-component';
import { InputTextComponent } from '@/components/partials/input-component';
import roles from '@/routes/admin/core/roles';
import { Fieldset } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { SaveIcon } from 'lucide-react';

export const RoleForm = ({ dataId }: { dataId?: number }) => {
    const { role, permissions } = usePage<any>().props;

    const { data, setData, post, put, processing, errors, transform } = useForm(
        {
            saveBack: 'false',
            name: role?.name || '',
            permissions:
                role?.permissions.map((permission: any) => permission.id) || [],
        },
    );

    // transformData
    transform((data: any) => ({
        ...data,
        ...(dataId && { _method: 'put' }),
    }));

    const groupedPermissions = Object.values(
        permissions.reduce((acc: any, permission: any) => {
            const parts = permission.name.split('-');

            // minimal harus ada action + subject
            if (parts.length < 2) return acc;

            const subject = parts.slice(1).join('-'); // handle "force-delete-user"

            if (!acc[subject]) {
                acc[subject] = {
                    group: subject,
                    permissions: [],
                };
            }

            acc[subject].permissions.push(permission);

            return acc;
        }, {}),
    );

    const togglePermission = (id: number) => {
        const currentPermissions = data.permissions || [];
        const newPermissions = currentPermissions.includes(id)
            ? currentPermissions.filter((x: any) => x !== id)
            : [...currentPermissions, id];

        setData('permissions', newPermissions);
    };

    const toggleAllInGroup = (group: any) => {
        const groupIds = group.permissions.map((p: any) => p.id);
        const isAllChecked = groupIds.every((id: any) =>
            data.permissions.includes(id),
        );

        const newPermissions = isAllChecked
            ? data.permissions.filter((id: any) => !groupIds.includes(id))
            : [...new Set([...data.permissions, ...groupIds])];

        setData('permissions', newPermissions);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (dataId) {
            put(roles.update(dataId).url, {});
        } else {
            post(roles.store().url, {});
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
            </div>
            <div className="flex flex-col space-y-4">
                <label className="text-sm font-semibold">Access Role</label>
                <div className="grid grid-cols-3 gap-4">
                    {groupedPermissions.map((group: any) => {
                        const groupIds = group.permissions.map(
                            (p: any) => p.id,
                        );
                        const allChecked = groupIds.every((id: any) =>
                            data.permissions.includes(id),
                        );

                        return (
                            <div
                                key={group.group}
                                className="rounded border p-4"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-base font-semibold capitalize">
                                        {group.group.replace(/[-_]/g, ' ')}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => toggleAllInGroup(group)}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {allChecked
                                            ? 'Uncheck All'
                                            : 'Check All'}
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {group.permissions.map(
                                        (permission: any) => (
                                            <CheckboxComponent
                                                key={permission.id}
                                                checked={data.permissions.includes(
                                                    permission.id,
                                                )}
                                                setChecked={() =>
                                                    togglePermission(
                                                        permission.id,
                                                    )
                                                }
                                                label={permission.name}
                                                className="flex items-center space-x-2"
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
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
