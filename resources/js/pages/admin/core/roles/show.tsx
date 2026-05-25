import { CheckboxComponent } from '@/components/partials/checkbox-component';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/utils/formatDate';
import { usePage } from '@inertiajs/react';
import { InfoIcon } from 'lucide-react';

export default function DetailPage() {
    const { role } = usePage<any>().props;

    const groupedPermissions = Object.values(
        role.permissions.reduce((acc: any, permission: any) => {
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

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                <Card className="min-h-full p-4 md:p-6">
                    <div className="flex items-center space-x-2">
                        <InfoIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                            Detail Information
                        </span>
                    </div>
                    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <li className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold">Name</span>
                            <span className="text-sm">{role.name}</span>
                        </li>
                        <li className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold">
                                Created At
                            </span>
                            <span className="text-sm">
                                {formatDate(role.created_at)}
                            </span>
                        </li>
                        <li className="flex flex-col space-y-2">
                            <span className="text-sm font-semibold">
                                Updated At
                            </span>
                            <span className="text-sm">
                                {formatDate(role.updated_at)}
                            </span>
                        </li>
                    </ul>
                    <div className="flex flex-col space-y-4">
                        <label className="text-sm font-semibold">
                            Access Role
                        </label>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {groupedPermissions.map((group: any) => {
                                const groupIds = group.permissions.map(
                                    (p: any) => p.id,
                                );
                                const allChecked = groupIds.every((id: any) =>
                                    role.permissions.some(
                                        (p: any) => p.id === id,
                                    ),
                                );

                                return (
                                    <div
                                        key={group.group}
                                        className="rounded border p-4"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold capitalize">
                                                {group.group.replace(
                                                    /[-_]/g,
                                                    ' ',
                                                )}
                                            </h3>
                                        </div>
                                        <div className="space-y-1">
                                            {group.permissions.map(
                                                (permission: any) => (
                                                    <CheckboxComponent
                                                        key={permission.id}
                                                        checked={role.permissions.some(
                                                            (p: any) =>
                                                                p.id ===
                                                                permission.id,
                                                        )}
                                                        disabled
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
                </Card>
            </div>
        </div>
    );
}
