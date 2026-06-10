<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('home/index');
    }

    public function about(): Response
    {
        return Inertia::render('home/about/index');
    }

    public function programs(): Response
    {
        return Inertia::render('home/programs/index');
    }

    public function programShow(string $slug): Response
    {
        return Inertia::render('home/programs/show', [
            'slug' => $slug,
        ]);
    }

    public function news(): Response
    {
        return Inertia::render('home/news/index');
    }

    public function newsShow(string $slug): Response
    {
        return Inertia::render('home/news/show', [
            'slug' => $slug,
        ]);
    }

    public function berita(): Response
    {
        return Inertia::render('home/berita/index');
    }

    public function beritaShow(string $slug): Response
    {
        return Inertia::render('home/berita/show', [
            'slug' => $slug,
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('home/contact');
    }
}
