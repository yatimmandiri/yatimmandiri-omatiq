<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use App\Models\Company\Olimpiade;
use App\Models\Company\Testimonial;
use Inertia\Inertia;

class MainController extends Controller
{
    public function index()
    {
        $data = [
            'pageTitle' => 'OMATIQ',
            'olimpiade' => Olimpiade::query()
                ->with(['objectiveItems' => fn ($query) => $query->active(), 'galleries' => fn ($query) => $query->active(), 'videoItems' => fn ($query) => $query->active()])
                ->active()
                ->ordered()
                ->take(2)
                ->get()
                ->map(fn (Olimpiade $olimpiade) => $this->toFrontendOlimpiade($olimpiade))
                ->values(),
            'testimonials' => Testimonial::query()
                ->active()
                ->type('testimonial')
                ->ordered()
                ->get()
                ->map(fn (Testimonial $testimonial) => $this->toFrontendTestimonial($testimonial))
                ->values(),
            'publicFigureReviews' => Testimonial::query()
                ->active()
                ->type('public_figure')
                ->ordered()
                ->get()
                ->map(fn (Testimonial $testimonial) => $this->toFrontendTestimonial($testimonial))
                ->values(),
            'meta' => [
                'title' => 'OMATIQ',
                'description' => 'OMATIQ adalah olimpiade nasional Al-Quran dan Matematika untuk anak Indonesia.',
                'keywords' => 'OMATIQ, pendidikan, olimpiade, Al-Quran, matematika',
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

    public function olimpiade()
    {
        $olimpiade = Olimpiade::query()
            ->with(['objectiveItems' => fn ($query) => $query->active(), 'galleries' => fn ($query) => $query->active(), 'videoItems' => fn ($query) => $query->active()])
            ->active()
            ->ordered()
            ->get()
            ->map(fn (Olimpiade $olimpiade) => $this->toFrontendOlimpiade($olimpiade))
            ->values();

        $data = [
            'pageTitle' => 'Olimpiade',
            'olimpiade' => $olimpiade,
            'meta' => [
                'title' => 'Olimpiade OMATIQ',
                'description' => 'Kenali cabang Olimpiade Al-Quran dan Matematika OMATIQ untuk anak Indonesia.',
                'keywords' => 'olimpiade OMATIQ, olimpiade Al-Quran, olimpiade matematika',
            ],
        ];

        return Inertia::render('home/olimpiade/index', $data);
    }

    public function olimpiadeShow(string $slug)
    {
        $olimpiade = Olimpiade::query()
            ->with(['objectiveItems' => fn ($query) => $query->active(), 'galleries' => fn ($query) => $query->active(), 'videoItems' => fn ($query) => $query->active()])
            ->active()
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedOlimpiade = Olimpiade::query()
            ->with(['objectiveItems' => fn ($query) => $query->active(), 'galleries' => fn ($query) => $query->active(), 'videoItems' => fn ($query) => $query->active()])
            ->active()
            ->whereKeyNot($olimpiade->getKey())
            ->ordered()
            ->take(3)
            ->get()
            ->map(fn (Olimpiade $item) => $this->toFrontendOlimpiade($item))
            ->values();

        $data = [
            'pageTitle' => $olimpiade->name,
            'slug' => $olimpiade->slug,
            'olimpiade' => $this->toFrontendOlimpiade($olimpiade),
            'relatedOlimpiade' => $relatedOlimpiade,
            'meta' => [
                'title' => $olimpiade->name.' | OMATIQ',
                'description' => $olimpiade->excerpt ?: $olimpiade->description,
                'keywords' => implode(', ', [
                    $olimpiade->name,
                    $olimpiade->category,
                    'OMATIQ',
                    'olimpiade nasional',
                ]),
            ],
        ];

        return Inertia::render('home/olimpiade/show', $data);
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

    private function toFrontendOlimpiade(Olimpiade $olimpiade): array
    {
        return [
            'id' => $olimpiade->id,
            'title' => $olimpiade->name,
            'slug' => $olimpiade->slug,
            'category' => $olimpiade->category,
            'excerpt' => $olimpiade->excerpt,
            'description' => $olimpiade->description ?: $olimpiade->excerpt ?: '',
            'image' => $olimpiade->featured_image_url ?: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85',
            'duration' => $olimpiade->duration ?: 'Nasional',
            'level' => $olimpiade->level ?: 'Semua peserta',
            'benefits' => $olimpiade->benefits ?? [],
            'overviewTitle' => $olimpiade->overview_title,
            'overviewDescription' => $olimpiade->overview_description,
            'objectives' => $olimpiade->objectiveItems->map(fn ($objective) => [
                'icon' => $objective->icon,
                'title' => $objective->title,
                'text' => $objective->text,
            ])->values(),
            'gallery' => $olimpiade->galleries->pluck('image_src')->values(),
            'videos' => $olimpiade->videoItems->map(fn ($video) => [
                'title' => $video->title,
                'description' => $video->description,
                'embedUrl' => $video->embed_url,
                'thumbnailUrl' => $video->thumbnail_url,
                'duration' => $video->duration,
                'tag' => $video->tag,
            ])->values(),
            'ctaDescription' => $olimpiade->cta_description,
            'registrationUrl' => $olimpiade->registration_url,
        ];
    }

    private function toFrontendTestimonial(Testimonial $testimonial): array
    {
        return [
            'id' => $testimonial->id,
            'name' => $testimonial->name,
            'role' => $testimonial->role,
            'quote' => $testimonial->quote,
            'avatar' => $testimonial->avatar_url ?: 'https://ui-avatars.com/api/?name='.urlencode($testimonial->name).'&background=0F60AC&color=fff',
            'rating' => $testimonial->rating,
            'focus' => $testimonial->focus,
        ];
    }
}
