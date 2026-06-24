<?php

namespace Database\Seeders;

use App\Models\Company\Slider;
use Illuminate\Database\Seeder;

class SliderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        collect([
            [
                'title' => 'Panen Harapan, Menuai Kesejahteraan',
                'subtitle' => 'Mengembangkan sektor pertanian yang produktif dan berkelanjutan.',
                'olimpiade_id' => 1,
                'url' => route('home.olimpiades.detail', ['olimpiade' => 'pertanian-dan-perkebunan']),
                'video_url' => 'https://www.youtube.com/watch?v=jX5FV-786cI'
            ],
            [
                'title' => 'Ternak Berkembang, Ekonomi Gemilang',
                'subtitle' => 'Menciptakan peluang usaha peternakan yang mandiri dan menguntungkan.',
                'olimpiade_id' => 2,
                'url' => route('home.olimpiades.detail', ['olimpiade' => 'peternakan']),
                'video_url' => 'https://www.youtube.com/watch?v=jX5FV-786cI'
            ],
            [
                'title' => 'Berdaya Bersama, Maju Bersama',
                'subtitle' => 'Menggerakkan potensi masyarakat menuju kesejahteraan.',
                'olimpiade_id' => 3,
                'url' => route('home.olimpiades.detail', ['olimpiade' => 'pemberdayaan-masyarakat']),
                'video_url' => 'https://www.youtube.com/watch?v=jX5FV-786cI'
            ],
        ])->each(fn($data) => Slider::create($data));
    }
}
