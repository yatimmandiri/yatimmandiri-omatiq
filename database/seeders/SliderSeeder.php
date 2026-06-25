<?php

namespace Database\Seeders;

use App\Models\Company\Olimpiade;
use App\Models\Company\Slider;
use Illuminate\Database\Seeder;

class SliderSeeder extends Seeder
{
    public function run(): void
    {
        $alquran = Olimpiade::query()->where('slug', 'olimpiade-alquran')->firstOrFail();
        $matematika = Olimpiade::query()->where('slug', 'olimpiade-matematika')->firstOrFail();

        $items = [
            [
                'title' => 'Olimpiade nasional untuk generasi cerdas dan berakhlak.',
                'subtitle' => 'OMATIQ menjadi ruang kompetisi nasional untuk anak Indonesia dengan pengalaman lomba yang seru, terarah, dan inspiratif.',
                'featured_image' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1920&q=85',
                'url' => '/olimpiade/'.$alquran->slug,
                'video_url' => 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
                'olimpiade_id' => $alquran->id,
            ],
            [
                'title' => 'Tajwid, cara baca, dan kecintaan pada Al-Quran.',
                'subtitle' => 'Anak berlatih memahami tajwid, membaca dengan tepat, dan tampil percaya diri dalam kompetisi yang positif.',
                'featured_image' => 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1920&q=85',
                'url' => '/olimpiade/'.$alquran->slug,
                'video_url' => 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
                'olimpiade_id' => $alquran->id,
            ],
            [
                'title' => 'Berani bernalar di Olimpiade Matematika.',
                'subtitle' => 'Tantangan nasional yang mengasah logika, ketelitian, strategi berhitung, dan keberanian memecahkan masalah.',
                'featured_image' => 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1920&q=85',
                'url' => '/olimpiade/'.$matematika->slug,
                'video_url' => 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
                'olimpiade_id' => $matematika->id,
            ],
        ];

        foreach ($items as $index => $item) {
            Slider::query()->updateOrCreate(
                ['title' => $item['title']],
                [...$item, 'sort_order' => $index + 1, 'status' => true],
            );
        }
    }
}
