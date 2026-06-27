import olimpiades from '@/routes/admin/companies/olimpiades';
import olimpiadeGalleries from '@/routes/admin/companies/olimpiade-galleries';
import olimpiadeObjectives from '@/routes/admin/companies/olimpiade-objectives';
import olimpiadeSchedules from '@/routes/admin/companies/olimpiade-schedules';
import olimpiadeVideos from '@/routes/admin/companies/olimpiade-videos';
import testimonials from '@/routes/admin/companies/testimonials';
import permissions from '@/routes/admin/core/permissions';
import districts from '@/routes/admin/core/regions/districts';
import provinces from '@/routes/admin/core/regions/provinces';
import regencies from '@/routes/admin/core/regions/regencies';
import villages from '@/routes/admin/core/regions/villages';
import roles from '@/routes/admin/core/roles';
import users from '@/routes/admin/core/users';
import activities from '@/routes/admin/logs/activities';
import site from '@/routes/admin/settings/site';
import { ChevronRight, CogIcon, CpuIcon, MapIcon, Trophy } from 'lucide-react';
import reviews from '@/routes/admin/companies/reviews';
import sliders from '@/routes/admin/companies/sliders';
import faqCompanies from '@/routes/admin/companies/faq-companies';

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
                                permission: 'view-province',
                                icon: ChevronRight,
                            },
                            {
                                title: 'Regencies',
                                href: regencies.index().url,
                                permission: 'view-regency',
                                icon: ChevronRight,
                            },
                            {
                                title: 'Districts',
                                href: districts.index().url,
                                permission: 'view-district',
                                icon: ChevronRight,
                            },
                            {
                                title: 'Villages',
                                href: villages.index().url,
                                permission: 'view-village',
                                icon: ChevronRight,
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Company',
                roles: ['Administrators'],
                icon: Trophy,
                children: [
                    {
                        title: 'Olimpiade',
                        href: olimpiades.index().url,
                        permission: 'view-olimpiade',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Objectives',
                        href: olimpiadeObjectives.index().url,
                        permission: 'view-olimpiade-objective',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Gallery',
                        href: olimpiadeGalleries.index().url,
                        permission: 'view-olimpiade-gallery',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Video',
                        href: olimpiadeVideos.index().url,
                        permission: 'view-olimpiade-video',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Jadwal Olimpiade',
                        href: olimpiadeSchedules.index().url,
                        permission: 'view-olimpiade-schedule',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Testimonials',
                        href: testimonials.index().url,
                        permission: 'view-testimonial',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Reviews',
                        href: reviews.index().url,
                        permission: 'view-review',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Sliders',
                        href: sliders.index().url,
                        permission: 'view-slider',
                        icon: ChevronRight,
                    },
                    {
                        title: 'FAQ Company',
                        href: faqCompanies.index().url,
                        permission: 'view-faq-company',
                        icon: ChevronRight,
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
                        href: site.edit().url,
                        permission: 'view-settings-site',
                        icon: ChevronRight,
                    },
                    {
                        title: 'Log Activity',
                        href: activities.index().url,
                        permission: 'view-log-activity',
                        icon: ChevronRight,
                    },
                ],
            },
        ],
    },
];
