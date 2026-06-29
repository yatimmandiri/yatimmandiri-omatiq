<?php

namespace Database\Seeders;

use App\Models\Company\FaqCompany;
use App\Models\Company\Olimpiade;
use Illuminate\Database\Seeder;

class FaqCompanySeeder extends Seeder
{
    public function run(): void
    {
        $alquran = Olimpiade::query()->where('slug', 'olimpiade-alquran')->firstOrFail();
        $matematika = Olimpiade::query()->where('slug', 'olimpiade-matematika')->firstOrFail();
        $items = [
            ['question' => 'Bagaimana cara mendaftar Olimpiade OMATIQ?', 'answer' => 'Hubungi tim OMATIQ melalui halaman kontak. Tim kami akan menjelaskan kategori peserta, jadwal, dan tahapan pendaftaran.', 'olimpiade_id' => $alquran->id],
            ['question' => 'Siapa saja yang dapat mengikuti OMATIQ?', 'answer' => 'OMATIQ dirancang untuk anak Indonesia sesuai jenjang dan kategori yang tersedia pada setiap cabang olimpiade.', 'olimpiade_id' => $matematika->id],
            ['question' => 'Apakah sekolah dan komunitas dapat menjadi mitra?', 'answer' => 'Ya. Sekolah, TPQ, komunitas guru, dan lembaga pendidikan dapat berkolaborasi sebagai mitra penyelenggara maupun pendamping peserta.', 'olimpiade_id' => $alquran->id],
            ['question' => 'Di mana informasi jadwal dan teknis lomba tersedia?', 'answer' => 'Informasi terbaru akan disampaikan melalui website dan kanal resmi OMATIQ setelah periode pendaftaran dibuka.', 'olimpiade_id' => $matematika->id],
        ];

        foreach ($items as $index => $item) {
            FaqCompany::query()->updateOrCreate(
                ['question' => $item['question']],
                [...$item, 'sort_order' => $index + 1, 'status' => true],
            );
        }
    }
}
