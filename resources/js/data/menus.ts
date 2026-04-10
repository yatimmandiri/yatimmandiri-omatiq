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
                        href: { name: 'permissions.index' },
                        permission: 'view-permission',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Roles',
                        href: { name: 'roles.index' },
                        permission: 'view-role',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Users',
                        href: { name: 'users.index' },
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
                                href: { name: 'provinces.index' },
                                permission: 'view-region',
                                icon: ChevronRight,
                            },
                            {
                                title: 'Regencies',
                                href: { name: 'regencies.index' },
                                permission: 'view-region',
                                icon: ChevronRight,
                            },
                            {
                                title: 'Districts',
                                href: { name: 'districts.index' },
                                permission: 'view-region',
                                icon: ChevronRight,
                            },
                            {
                                title: 'Villages',
                                href: { name: 'villages.index' },
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
                        href: { name: 'settings.site.edit' },
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
