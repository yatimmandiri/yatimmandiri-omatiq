<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class MainController extends Controller
{
    public function index()
    {
        $data = [
            'pageTitle' => 'OMATIQ',
            'meta' => [
                'title' => 'OMATIQ',
                'description' => 'OMATIQ is a modern education and community platform for creative learning, collaboration, and real impact.',
                'keywords' => 'OMATIQ, education, community, learning, programs',
            ],
        ];

        return Inertia::render('home/index', $data);
    }

    public function about()
    {
        $data = [
            'pageTitle' => 'About Us',
            'meta' => [
                'title' => 'About Us',
                'description' => 'Learn more about our company and mission.',
                'keywords' => 'about us, company, mission',
            ],
        ];

        return Inertia::render('home/about/index', $data);
    }

    public function programs()
    {
        $data = [
            'pageTitle' => 'Programs',
            'meta' => [
                'title' => 'Programs',
                'description' => 'Explore our various programs and offerings.',
                'keywords' => 'programs, offerings, company',
            ],
        ];

        return Inertia::render('home/programs/index', $data);
    }

    public function programShow(string $slug)
    {
        $data = [
            'pageTitle' => 'Program Detail',
            'slug' => $slug,
            'meta' => [
                'title' => 'Program Detail',
                'description' => 'Detailed information about our program.',
                'keywords' => 'program detail, program, company',
            ],
        ];

        return Inertia::render('home/programs/show', $data);
    }

    public function news()
    {
        $data = [
            'pageTitle' => 'News',
            'meta' => [
                'title' => 'News',
                'description' => 'Latest news and updates.',
                'keywords' => 'news, updates, company',
            ],
        ];

        return Inertia::render('home/news/index', $data);
    }

    public function newsShow(string $slug)
    {
        $data = [
            'pageTitle' => 'News Detail',
            'slug' => $slug,
            'meta' => [
                'title' => 'News Detail',
                'description' => 'Detailed information about the news article.',
                'keywords' => 'news detail, news, company',
            ],
        ];

        return Inertia::render('home/news/show', $data);
    }

    public function berita()
    {
        $data = [
            'pageTitle' => 'Berita',
            'meta' => [
                'title' => 'Berita',
                'description' => 'Latest news and updates.',
                'keywords' => 'berita, updates, company',
            ],
        ];

        return Inertia::render('home/berita/index', $data);
    }

    public function beritaShow(string $slug)
    {
        $data = [
            'pageTitle' => 'Detail Berita',
            'slug' => $slug,
            'meta' => [
                'title' => 'Detail Berita',
                'description' => 'Detailed information about the berita article.',
                'keywords' => 'detail berita, berita, company',
            ],
        ];

        return Inertia::render('home/berita/show', $data);
    }

    public function contact()
    {
        $data = [
            'pageTitle' => 'Contact Us',
            'meta' => [
                'title' => 'Contact Us',
                'description' => 'Get in touch with us through our contact page.',
                'keywords' => 'contact, get in touch, company',
            ],
        ];

        return Inertia::render('home/contact', $data);
    }
}
