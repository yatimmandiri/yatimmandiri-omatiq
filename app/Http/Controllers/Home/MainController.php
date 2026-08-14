<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use App\Models\Company\FaqCompany;
use App\Models\Company\Olimpiade;
use App\Models\Company\OlimpiadeSchedule;
use App\Models\Company\Review;
use App\Models\Company\Slider;
use App\Models\Company\Testimonial;
use Inertia\Inertia;

class MainController extends Controller
{
    public function index()
    {
        $data = [
            'pageTitle' => 'OMATIQ',
            'olimpiade' => Olimpiade::query()
                ->with($this->olimpiadeRelations())
                ->active()
                ->ordered()
                ->take(2)
                ->get()
                ->map(fn (Olimpiade $olimpiade) => $this->toFrontendOlimpiade($olimpiade))
                ->values(),
            'testimonials' => Testimonial::get(),
            'reviews' => Review::get(),
            'sliders' => Slider::query()->active()->ordered()->get(),
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

    public function milestone()
    {
        $data = [
            'pageTitle' => 'Perjalanan OMATIQ',
            'meta' => [
                'title' => 'Perjalanan OMATIQ',
                'description' => 'Sejarah dan perjalanan OMATIQ dari tahun ke tahun: dari OGN hingga satu dekade menyalakan mimpi anak Indonesia.',
                'keywords' => 'perjalanan OMATIQ, sejarah OMATIQ, milestone OMATIQ, OGN, olimpiade nasional',
            ],
        ];

        return Inertia::render('home/milestone/index', $data);
    }

    public function olimpiade()
    {
        $olimpiade = Olimpiade::query()
            ->with($this->olimpiadeRelations())
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
            ->with($this->olimpiadeRelations())
            ->active()
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedOlimpiade = Olimpiade::query()
            ->with($this->olimpiadeRelations())
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
            'faqs' => FaqCompany::query()
                // ->active()
                ->where('olimpiade_id', $olimpiade->id)
                // ->ordered()
                ->get(['id', 'question', 'answer']),
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

    public function schedule()
    {
        $schedules = OlimpiadeSchedule::query()
            ->with('olimpiade:id,name,slug,category,featured_image')
            ->active()
            ->ordered()
            ->get()
            ->map(fn (OlimpiadeSchedule $schedule) => $this->toFrontendSchedule($schedule))
            ->values();

        $data = [
            'pageTitle' => 'Jadwal OMATIQ',
            'schedules' => $schedules,
            'meta' => [
                'title' => 'Jadwal OMATIQ',
                'description' => 'Kalender tahunan OMATIQ dari registrasi, penyisihan, knockout, sampai final nasional.',
                'keywords' => 'jadwal OMATIQ, kalender olimpiade, registrasi olimpiade, final OMATIQ',
            ],
        ];

        return Inertia::render('home/schedule/index', $data);
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
            'faqs' => FaqCompany::query()
                ->with('olimpiade:id,name')
                // ->active()
                // ->ordered()
                ->get(['id', 'question', 'answer', 'olimpiade_id']),
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
        $schedules = $olimpiade->relationLoaded('schedules')
            ? $olimpiade->schedules->map(fn (OlimpiadeSchedule $schedule) => $this->toFrontendSchedule($schedule))->values()
            : collect();

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
                'thumbnailUrl' => $video->thumbnail_src,
                'duration' => $video->duration,
                'tag' => $video->tag,
            ])->values(),
            'schedules' => $schedules,
            'nextSchedule' => $schedules->first(),
            'ctaDescription' => $olimpiade->cta_description,
            'registrationUrl' => $olimpiade->registration_url,
        ];
    }

    private function olimpiadeRelations(): array
    {
        return [
            'objectiveItems' => fn ($query) => $query->active(),
            'galleries' => fn ($query) => $query->active(),
            'videoItems' => fn ($query) => $query->active(),
            'schedules' => fn ($query) => $query->active(),
        ];
    }

    private function toFrontendSchedule(OlimpiadeSchedule $schedule): array
    {
        return [
            'id' => $schedule->id,
            'title' => $schedule->title,
            'phase' => $schedule->phase,
            'phaseLabel' => $this->phaseLabel($schedule->phase),
            'startDate' => optional($schedule->start_date)->toDateString(),
            'endDate' => optional($schedule->end_date)->toDateString(),
            'dateLabel' => $this->dateRangeLabel($schedule),
            'location' => $schedule->location,
            'description' => $schedule->description,
            'actionLabel' => $schedule->action_label,
            'actionUrl' => $schedule->action_url,
            'color' => $schedule->color,
            'olimpiade' => $schedule->relationLoaded('olimpiade') && $schedule->olimpiade ? [
                'id' => $schedule->olimpiade->id,
                'title' => $schedule->olimpiade->name,
                'slug' => $schedule->olimpiade->slug,
                'category' => $schedule->olimpiade->category,
                'image' => $schedule->olimpiade->featured_image_url,
            ] : null,
        ];
    }

    private function dateRangeLabel(OlimpiadeSchedule $schedule): string
    {
        $start = $this->shortDateLabel($schedule->start_date);
        $end = $this->shortDateLabel($schedule->end_date);

        if (! $end || $end === $start) {
            return $start ?: '-';
        }

        return "{$start} - {$end}";
    }

    private function shortDateLabel($date): ?string
    {
        if (! $date) {
            return null;
        }

        $months = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        ];

        return sprintf('%02d %s %s', $date->day, $months[$date->month], $date->year);
    }

    private function phaseLabel(string $phase): string
    {
        return [
            'registration' => 'Registrasi',
            'technical_meeting' => 'Technical Meeting',
            'preliminary' => 'Babak Penyisihan',
            'knockout' => 'Fase Knockout',
            'semifinal' => 'Semifinal',
            'final' => 'Final Nasional',
            'announcement' => 'Pengumuman',
        ][$phase] ?? str($phase)->headline()->toString();
    }
}
