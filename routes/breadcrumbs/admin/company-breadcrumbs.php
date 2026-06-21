<?php

use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

Breadcrumbs::for(
    'admin.companies.olimpiades.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Olimpiade', route('admin.companies.olimpiades.index')),
);

foreach ([
    'olimpiade-objectives' => 'Objectives',
    'olimpiade-galleries' => 'Gallery',
    'olimpiade-videos' => 'Video',
] as $resource => $label) {
    Breadcrumbs::for(
        "admin.companies.{$resource}.index",
        fn (BreadcrumbTrail $trail) => $trail->parent('admin.dashboard')->push($label, route("admin.companies.{$resource}.index")),
    );
    Breadcrumbs::for(
        "admin.companies.{$resource}.create",
        fn (BreadcrumbTrail $trail) => $trail->parent("admin.companies.{$resource}.index")->push('Create', route("admin.companies.{$resource}.create")),
    );
    Breadcrumbs::for(
        "admin.companies.{$resource}.show",
        fn (BreadcrumbTrail $trail, $item) => $trail->parent("admin.companies.{$resource}.index")->push($item->title ?: $label, route("admin.companies.{$resource}.show", $item)),
    );
    Breadcrumbs::for(
        "admin.companies.{$resource}.edit",
        fn (BreadcrumbTrail $trail, $item) => $trail->parent("admin.companies.{$resource}.show", $item)->push('Edit', route("admin.companies.{$resource}.edit", $item)),
    );
    Breadcrumbs::for(
        "admin.companies.{$resource}.data",
        fn (BreadcrumbTrail $trail) => $trail->parent("admin.companies.{$resource}.index")->push("{$label} Data", route("admin.companies.{$resource}.data")),
    );
}

Breadcrumbs::for(
    'admin.companies.testimonials.index',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.dashboard')
        ->push('Testimonials', route('admin.companies.testimonials.index')),
);

Breadcrumbs::for(
    'admin.companies.testimonials.create',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.companies.testimonials.index')
        ->push('Create', route('admin.companies.testimonials.create')),
);

Breadcrumbs::for(
    'admin.companies.testimonials.show',
    fn (BreadcrumbTrail $trail, $testimonial) => $trail
        ->parent('admin.companies.testimonials.index')
        ->push($testimonial->name, route('admin.companies.testimonials.show', $testimonial)),
);

Breadcrumbs::for(
    'admin.companies.testimonials.edit',
    fn (BreadcrumbTrail $trail, $testimonial) => $trail
        ->parent('admin.companies.testimonials.show', $testimonial)
        ->push('Edit', route('admin.companies.testimonials.edit', $testimonial)),
);

Breadcrumbs::for(
    'admin.companies.testimonials.data',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.companies.testimonials.index')
        ->push('Testimonial Data', route('admin.companies.testimonials.data')),
);

Breadcrumbs::for(
    'admin.companies.olimpiades.create',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.companies.olimpiades.index')
        ->push('Create', route('admin.companies.olimpiades.create')),
);

Breadcrumbs::for(
    'admin.companies.olimpiades.show',
    fn (BreadcrumbTrail $trail, $olimpiade) => $trail
        ->parent('admin.companies.olimpiades.index')
        ->push(
            $olimpiade->name,
            route('admin.companies.olimpiades.show', $olimpiade),
        ),
);

Breadcrumbs::for(
    'admin.companies.olimpiades.edit',
    fn (BreadcrumbTrail $trail, $olimpiade) => $trail
        ->parent('admin.companies.olimpiades.show', $olimpiade)
        ->push(
            'Edit',
            route('admin.companies.olimpiades.edit', $olimpiade),
        ),
);

Breadcrumbs::for(
    'admin.companies.olimpiades.data',
    fn (BreadcrumbTrail $trail) => $trail
        ->parent('admin.companies.olimpiades.index')
        ->push('Olimpiade Data', route('admin.companies.olimpiades.data')),
);
