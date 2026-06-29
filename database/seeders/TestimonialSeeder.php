<?php

namespace Database\Seeders;

use App\Models\Company\Review;
use App\Models\Company\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            ['name' => 'Nadia Putri', 'role' => 'Orang Tua Peserta', 'quote' => 'OMATIQ membuat anak saya lebih semangat belajar. Lomba terasa serius, tapi tetap ramah untuk anak-anak.', 'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'rating' => 5, 'olimpiade_id' => 1],
            ['name' => 'Rizky Pratama', 'role' => 'Peserta Al-Quran', 'quote' => 'Saya senang bisa ikut olimpiade ini. Soalnya menantang, tapi saya jadi lebih percaya diri membaca Al-Quran.', 'avatar' => 'https://images.unsplash.com/photo-1502767089025-6572583495b0?auto=format&fit=crop&w=300&q=80', 'rating' => 5, 'olimpiade_id' => 2],
            ['name' => 'Siti Aisyah', 'role' => 'Guru Pendamping', 'quote' => 'OMATIQ memberikan pengalaman lomba yang menyenangkan bagi anak-anak. Mereka belajar berkompetisi dengan cara yang positif.', 'avatar' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', 'rating' => 5, 'olimpiade_id' => 1],
            ['name' => 'Ahmad Fauzan', 'role' => 'Orang Tua Peserta Matematika', 'quote' => 'Anak saya jadi lebih teliti dan percaya diri dalam mengerjakan soal matematika. OMATIQ memberi pengalaman lomba yang positif.', 'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', 'rating' => 5, 'olimpiade_id' => 2],
            ['name' => 'Rafi Ananda', 'role' => 'Peserta Matematika', 'quote' => 'Saya jadi lebih berani mengerjakan soal dan senang bisa ikut olimpiade bersama teman-teman dari daerah lain.', 'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'rating' => 5, 'olimpiade_id' => 1],
            ['name' => 'Sinta Lestari', 'role' => 'Guru Pendamping', 'quote' => 'Formatnya mudah dipahami. Anak-anak punya target latihan yang jelas dan termotivasi untuk berprestasi.', 'avatar' => 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=300&q=80', 'rating' => 5, 'olimpiade_id' => 2],
            ['name' => 'Ahmad Fauzan', 'role' => 'Orang Tua Peserta Al-Quran', 'quote' => 'Anak saya jadi lebih teliti membaca dan lebih percaya diri ketika diminta tampil. OMATIQ memberi pengalaman lomba yang positif.', 'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', 'rating' => 5, 'olimpiade_id' => 2],
            ['name' => 'Maya Kirana', 'role' => 'Kepala Sekolah Mitra', 'quote' => 'Kami melihat OMATIQ sebagai ajang yang rapi dan membangun. Anak-anak belajar berkompetisi tanpa kehilangan semangat belajar.', 'avatar' => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80', 'rating' => 5, 'olimpiade_id' => 1],
        ];

        $reviews = [
            ['name' => 'Daffa Mahendra', 'role' => 'Finalis OMATIQ', 'quote' => 'Soalnya menantang, tapi seru. Saya jadi ingin latihan lagi supaya bisa lebih siap di babak berikutnya.', 'avatar' => 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=300&q=80', 'rating' => 5, 'focus' => 'Pendidikan Karakter'],
            ['name' => 'Dr. Aisyah Rahmani', 'role' => 'Tokoh Pendidikan Anak', 'quote' => 'OMATIQ memberi ruang kompetisi yang sehat. Anak-anak tidak hanya mengejar nilai, tetapi belajar disiplin, percaya diri, dan mencintai proses.', 'avatar' => 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=500&q=80', 'rating' => 5, 'focus' => 'Pendidikan Karakter'],
            ['name' => 'Ust. Farhan Al-Hafidz', 'role' => 'Pembina Tahsin Nasional', 'quote' => 'Olimpiade Al-Quran di OMATIQ penting karena mempertemukan ketelitian tajwid dengan semangat anak-anak untuk membaca lebih baik.', 'avatar' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80', 'rating' => 5, 'focus' => 'Tajwid & Tahsin'],
            ['name' => 'Prof. Bima Santoso', 'role' => 'Pemerhati Matematika Dasar', 'quote' => 'Matematika perlu dibuat menantang sekaligus menyenangkan. OMATIQ punya peluang besar untuk menumbuhkan keberanian bernalar sejak dini.', 'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80', 'rating' => 5, 'focus' => 'Logika Matematika'],
            ['name' => 'Nadia Paramitha', 'role' => 'Duta Literasi Keluarga', 'quote' => 'Saya suka cara OMATIQ melibatkan sekolah, guru, dan orang tua. Anak merasa punya panggung, sementara pendamping punya arah yang jelas.', 'avatar' => 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80', 'rating' => 5, 'focus' => 'Kolaborasi Keluarga'],
            ['name' => 'Raka Adinata', 'role' => 'Pegiat Kompetisi Pelajar', 'quote' => 'Ajang seperti OMATIQ bisa menjadi pengalaman pertama yang membekas bagi anak-anak untuk berani tampil di skala nasional.', 'avatar' => 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=500&q=80', 'rating' => 5, 'focus' => 'Prestasi Nasional'],
        ];

        foreach ($testimonials as $index => $item) {
            Testimonial::query()->updateOrCreate(
                ['name' => $item['name']],
                [...$item, 'sort_order' => $index + 1, 'status' => true],
            );
        }

        foreach ($reviews as $index => $item) {
            Review::query()->updateOrCreate(
                ['name' => $item['name']],
                [...$item, 'sort_order' => $index + 1, 'status' => true],
            );
        }
    }
}
