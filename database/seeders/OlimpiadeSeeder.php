<?php

namespace Database\Seeders;

use App\Models\Company\Olimpiade;
use App\Models\Company\OlimpiadeGallery;
use App\Models\Company\OlimpiadeObjective;
use App\Models\Company\OlimpiadeVideo;
use Illuminate\Database\Seeder;

class OlimpiadeSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'name' => "Olimpiade Al-Qur'an",
                'slug' => 'olimpiade-alquran',
                'category' => "Al-Qur'an",
                'excerpt' => "Ajang nasional untuk menguatkan tajwid, ketepatan cara baca, dan kecintaan anak pada Al-Qur'an.",
                'description' => "Cabang olimpiade untuk menguji pemahaman tajwid, ketepatan cara baca, adab, dan keberanian anak saat membaca Al-Qur'an.",
                'featured_image' => 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1400&q=85',
                'duration' => 'Nasional',
                'level' => 'SD - SMP',
                'benefits' => [
                    'Memahami dan menerapkan hukum tajwid',
                    'Merapikan makhraj dan cara baca',
                    'Menumbuhkan adab serta percaya diri',
                ],
                'overview_title' => "Apa yang akan dialami peserta Al-Qur'an?",
                'overview_description' => "Cabang Al-Qur'an membantu anak menguatkan pemahaman tajwid, ketepatan pelafalan, adab membaca, dan keberanian tampil di panggung lomba yang positif.",
                'objectives' => [
                    [
                        'icon' => 'book-open-check',
                        'title' => 'Memahami tajwid',
                        'text' => 'Peserta berlatih mengenali hukum bacaan dan menerapkannya dengan lebih teliti.',
                    ],
                    [
                        'icon' => 'compass',
                        'title' => 'Merapikan cara baca',
                        'text' => "Anak didorong membaca Al-Qur'an dengan pelafalan yang lebih jelas, tenang, dan percaya diri.",
                    ],
                    [
                        'icon' => 'sparkles',
                        'title' => 'Menumbuhkan adab',
                        'text' => 'Kompetisi dibangun dengan suasana ramah agar anak belajar disiplin, hormat, dan rendah hati.',
                    ],
                ],
                'gallery' => [
                    'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1603989872628-78892812af9c?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=85',
                ],
                'videos' => [
                    [
                        'title' => 'Suasana tilawah peserta OMATIQ',
                        'description' => 'Cuplikan panggung, ruang tunggu, dan momen peserta menampilkan bacaan terbaiknya.',
                        'embedUrl' => 'https://www.youtube.com/embed/ysz5S6PUM-U',
                        'duration' => '03:18',
                        'tag' => 'Highlight',
                    ],
                    [
                        'title' => "Cerita pendamping Al-Qur'an",
                        'description' => 'Testimoni singkat tentang persiapan, adab lomba, dan dukungan orang tua.',
                        'embedUrl' => 'https://www.youtube.com/embed/jfKfPfyJRdk',
                        'duration' => '04:05',
                        'tag' => 'Behind the scene',
                    ],
                ],
                'cta_description' => "Kirim pesan ke tim OMATIQ untuk mengetahui informasi pendaftaran, kategori peserta, dan persiapan Olimpiade Al-Qur'an.",
                'registration_url' => '/kontak',
                'event_year' => 2026,
                'status' => true,
                'recommended' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Olimpiade Matematika',
                'slug' => 'olimpiade-matematika',
                'category' => 'Matematika',
                'excerpt' => 'Ajang nasional untuk mengasah logika, ketelitian, strategi berhitung, dan keberanian anak menyelesaikan soal.',
                'description' => 'Cabang olimpiade yang menantang anak untuk berpikir runtut, membaca pola, dan memilih strategi penyelesaian soal dengan percaya diri.',
                'featured_image' => 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1400&q=85',
                'duration' => 'Nasional',
                'level' => 'SD - SMP',
                'benefits' => [
                    'Mengasah logika dan ketelitian',
                    'Melatih kemampuan problem solving',
                    'Membangun mental berkompetisi',
                ],
                'overview_title' => 'Apa yang akan dialami peserta Matematika?',
                'overview_description' => 'Cabang Matematika dirancang untuk melatih logika, ketelitian, strategi menyelesaikan soal, dan mental berani mencoba tantangan baru.',
                'objectives' => [
                    [
                        'icon' => 'calculator',
                        'title' => 'Mengasah logika',
                        'text' => 'Peserta belajar membaca pola, memahami konsep dasar, dan memilih strategi pengerjaan yang tepat.',
                    ],
                    [
                        'icon' => 'brain',
                        'title' => 'Melatih problem solving',
                        'text' => 'Soal dibuat menantang agar anak terbiasa berpikir runtut, teliti, dan tidak mudah menyerah.',
                    ],
                    [
                        'icon' => 'trophy',
                        'title' => 'Berani berkompetisi',
                        'text' => 'Anak mendapatkan pengalaman tampil dalam ajang nasional yang sehat dan membangun percaya diri.',
                    ],
                ],
                'gallery' => [
                    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=85',
                    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=85',
                ],
                'videos' => [
                    [
                        'title' => 'Arena soal Matematika OMATIQ',
                        'description' => 'Momen peserta mengerjakan soal, berdiskusi setelah lomba, dan merayakan proses belajar.',
                        'embedUrl' => 'https://www.youtube.com/embed/ysz5S6PUM-U',
                        'duration' => '02:47',
                        'tag' => 'Competition day',
                    ],
                    [
                        'title' => 'Strategi belajar sebelum lomba',
                        'description' => 'Cuplikan persiapan peserta dalam memahami pola soal dan menjaga fokus.',
                        'embedUrl' => 'https://www.youtube.com/embed/jfKfPfyJRdk',
                        'duration' => '03:52',
                        'tag' => 'Preparation',
                    ],
                ],
                'cta_description' => 'Kirim pesan ke tim OMATIQ untuk mengetahui informasi pendaftaran, level soal, dan panduan persiapan Olimpiade Matematika.',
                'registration_url' => '/kontak',
                'event_year' => 2026,
                'status' => true,
                'recommended' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($items as $item) {
            $objectives = $item['objectives'];
            $gallery = $item['gallery'];
            $videos = $item['videos'];
            unset($item['objectives'], $item['gallery'], $item['videos']);

            $olimpiade = Olimpiade::query()->updateOrCreate(
                ['slug' => $item['slug']],
                $item,
            );

            foreach ($objectives as $index => $objective) {
                OlimpiadeObjective::query()->updateOrCreate(
                    ['olimpiade_id' => $olimpiade->id, 'title' => $objective['title']],
                    [...$objective, 'sort_order' => $index + 1, 'status' => true],
                );
            }

            foreach ($gallery as $index => $imageUrl) {
                OlimpiadeGallery::query()->updateOrCreate(
                    ['olimpiade_id' => $olimpiade->id, 'image_url' => $imageUrl],
                    ['title' => $olimpiade->name.' '.($index + 1), 'alt_text' => 'Dokumentasi '.$olimpiade->name, 'sort_order' => $index + 1, 'status' => true],
                );
            }

            foreach ($videos as $index => $video) {
                OlimpiadeVideo::query()->updateOrCreate(
                    ['olimpiade_id' => $olimpiade->id, 'embed_url' => $video['embedUrl']],
                    [
                        'title' => $video['title'],
                        'description' => $video['description'] ?? null,
                        'duration' => $video['duration'] ?? null,
                        'tag' => $video['tag'] ?? null,
                        'sort_order' => $index + 1,
                        'status' => true,
                    ],
                );
            }
        }
    }
}
