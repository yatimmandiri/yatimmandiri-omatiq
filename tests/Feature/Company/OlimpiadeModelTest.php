<?php

use App\Models\Company\Olimpiade;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates an olympiad with an automatic slug and structured content', function () {
    $olimpiade = Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
        'description' => 'Olimpiade nasional untuk melatih logika dan ketelitian.',
        'benefits' => ['Logika dasar', 'Problem solving'],
        'objectives' => [
            [
                'title' => 'Mengasah logika',
                'text' => 'Peserta belajar membaca pola dan memilih strategi.',
                'icon' => 'calculator',
            ],
        ],
        'gallery' => [
            ['url' => 'https://example.com/gallery-1.jpg', 'alt' => 'Suasana lomba'],
        ],
        'videos' => [
            [
                'title' => 'Arena Olimpiade OMATIQ',
                'url' => 'https://www.youtube.com/watch?v=example',
                'duration' => '03:18',
            ],
        ],
    ]);

    expect($olimpiade)
        ->slug->toBe('olimpiade-matematika')
        ->benefits->toBe(['Logika dasar', 'Problem solving'])
        ->objectives->toHaveCount(1)
        ->gallery->toHaveCount(1)
        ->videos->toHaveCount(1)
        ->status->toBeTrue()
        ->recommended->toBeFalse();
});

it('filters and orders olympiads for public pages', function () {
    Olimpiade::create([
        'name' => 'Olimpiade Matematika',
        'category' => 'Matematika',
        'status' => true,
        'recommended' => true,
        'sort_order' => 2,
    ]);

    Olimpiade::create([
        'name' => 'Olimpiade Al-Quran',
        'category' => 'Al-Quran',
        'status' => true,
        'recommended' => true,
        'sort_order' => 1,
    ]);

    Olimpiade::create([
        'name' => 'Olimpiade Tidak Aktif',
        'category' => 'Matematika',
        'status' => false,
        'recommended' => true,
        'sort_order' => 0,
    ]);

    $olimpiade = Olimpiade::query()
        ->active()
        ->recommended()
        ->ordered()
        ->get();

    expect($olimpiade)
        ->toHaveCount(2)
        ->pluck('name')->all()->toBe([
            'Olimpiade Al-Quran',
            'Olimpiade Matematika',
        ]);

    expect(Olimpiade::query()->search('Al-Quran')->count())->toBe(1);
});
