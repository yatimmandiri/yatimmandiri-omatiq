import permissions from '@/routes/admin/core/permissions';
import districts from '@/routes/admin/core/regions/districts';
import provinces from '@/routes/admin/core/regions/provinces';
import regencies from '@/routes/admin/core/regions/regencies';
import villages from '@/routes/admin/core/regions/villages';
import roles from '@/routes/admin/core/roles';
import users from '@/routes/admin/core/users';
import settings from '@/routes/admin/settings';
import { ChevronRight, CogIcon, CpuIcon, MapIcon } from 'lucide-react';

export const NavigationList = [
    {
        title: 'Platform',
        roles: ['Administrators'],
        children: [
            {
                title: 'System Core',
                roles: ['Administrators'],
                icon: CpuIcon,
                children: [
                    {
                        title: 'Permissions',
                        href: permissions.index().url,
                        permission: 'view-permission',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Roles',
                        href: roles.index().url,
                        permission: 'view-role',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Users',
                        href: users.index().url,
                        permission: 'view-user',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Regions',
                        roles: ['Administrators'],
                        icon: MapIcon,
                        children: [
                            {
                                title: 'Provinces',
                                href: provinces.index().url,
                                permission: 'view-region',
                                icon: ChevronRight,
                            },
                            {
                                title: 'Regencies',
                                href: regencies.index().url,
                                permission: 'view-region',
                                icon: ChevronRight,
                            },
                            {
                                title: 'Districts',
                                href: districts.index().url,
                                permission: 'view-region',
                                icon: ChevronRight,
                            },
                            {
                                title: 'Villages',
                                href: villages.index().url,
                                permission: 'view-region',
                                icon: ChevronRight,
                            },
                        ],
                    },
                ],
            },

            {
                title: 'Settings',
                roles: ['Administrators'],
                icon: CogIcon,
                children: [
                    {
                        title: 'Site',
                        href: settings.site.edit().url,
                        permission: 'view-settings-site',
                        icon: ChevronRight,
                    },
                ],
            },
        ],
    },
    {
        title: 'Fundraising',
        roles: ['Administrators'],
        children: [],
    },
];
