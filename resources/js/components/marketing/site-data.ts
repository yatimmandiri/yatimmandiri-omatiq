export type ProgramItem = {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string;
    image: string;
    duration: string;
    level: string;
    benefits: string[];
};

export type NewsItem = {
    id: number;
    title: string;
    slug: string;
    category: string;
    date: string;
    excerpt: string;
    image: string;
    author: string;
    readTime: string;
    link?: string;
};

export type TestimonialItem = {
    id: number;
    name: string;
    role: string;
    quote: string;
    avatar: string;
    rating: number;
};

export const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Olimpiade', href: '/programs' },
    { label: 'News', href: '/berita' },
    { label: 'Contact', href: '/kontak' },
];

export const programs: ProgramItem[] = [
    {
        id: 1,
        title: "Olimpiade Al-Qur'an",
        slug: 'olimpiade-alquran',
        category: "Al-Qur'an",
        description:
            "Cabang olimpiade untuk menguji pemahaman tajwid, ketepatan cara baca, dan kecintaan anak pada Al-Qur'an.",
        image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80',
        duration: 'Nasional',
        level: 'SD - SMP',
        benefits: ['Soal tajwid', 'Cara baca', 'Pembinaan adab'],
    },
    {
        id: 2,
        title: 'Olimpiade Matematika',
        slug: 'olimpiade-matematika',
        category: 'Matematika',
        description:
            'Cabang olimpiade untuk mengasah logika, ketelitian, strategi berhitung, dan keberanian menyelesaikan soal.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
        duration: 'Nasional',
        level: 'SD - SMP',
        benefits: ['Logika dasar', 'Problem solving', 'Strategi soal'],
    },
    {
        id: 3,
        title: 'Try Out OMATIQ',
        slug: 'try-out-omatiq',
        category: 'Persiapan',
        description:
            'Sesi persiapan untuk membantu peserta memahami format soal, ritme lomba, dan strategi menjelang olimpiade.',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        duration: 'Pra lomba',
        level: 'Semua peserta',
        benefits: ['Simulasi soal', 'Pembahasan', 'Evaluasi kesiapan'],
    },
];

export const news: NewsItem[] = [
    {
        id: 1,
        title: 'OMATIQ menyiapkan olimpiade nasional untuk anak Indonesia',
        slug: 'omatiq-olimpiade-nasional-anak-indonesia',
        category: 'Olimpiade',
        date: '10 Juni 2026',
        excerpt:
            "Ajang ini dirancang untuk mengasah kemampuan Al-Qur'an dan Matematika melalui pengalaman lomba yang menyenangkan dan tertata.",
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
        author: 'OMATIQ Editorial',
        readTime: '4 min read',
    },
    {
        id: 2,
        title: 'Kenapa tajwid dan matematika penting dilombakan sejak dini',
        slug: 'tajwid-matematika-penting-sejak-dini',
        category: 'Insight',
        date: '4 Juni 2026',
        excerpt:
            'Dua bidang ini membantu anak membangun akhlak, ketelitian, logika, dan percaya diri dalam proses belajar.',
        image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
        author: 'Learning Team',
        readTime: '6 min read',
    },
    {
        id: 3,
        title: 'Dari daerah menuju panggung nasional OMATIQ',
        slug: 'dari-daerah-menuju-panggung-nasional',
        category: 'Impact',
        date: '28 Mei 2026',
        excerpt:
            'OMATIQ membuka ruang bagi sekolah, guru, orang tua, dan komunitas untuk mendukung prestasi anak Indonesia.',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
        author: 'Impact Team',
        readTime: '5 min read',
    },
];

export const testimonials: TestimonialItem[] = [
    {
        id: 1,
        name: 'Nadia Putri',
        role: 'Orang Tua Peserta',
        quote: 'OMATIQ membuat anak saya lebih semangat belajar. Lomba terasa serius, tapi tetap ramah untuk anak-anak.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        rating: 5,
    },
    {
        id: 2,
        name: 'Rafi Ananda',
        role: 'Peserta Matematika',
        quote: 'Saya jadi lebih berani mengerjakan soal dan senang bisa ikut olimpiade bersama teman-teman dari daerah lain.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        rating: 5,
    },
    {
        id: 3,
        name: 'Sinta Lestari',
        role: 'Guru Pendamping',
        quote: 'Formatnya mudah dipahami. Anak-anak punya target latihan yang jelas dan termotivasi untuk berprestasi.',
        avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=300&q=80',
        rating: 5,
    },
    {
        id: 4,
        name: 'Ahmad Fauzan',
        role: 'Orang Tua Peserta Al-Quran',
        quote: 'Anak saya jadi lebih teliti membaca dan lebih percaya diri ketika diminta tampil. OMATIQ memberi pengalaman lomba yang positif.',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
        rating: 5,
    },
    {
        id: 5,
        name: 'Maya Kirana',
        role: 'Kepala Sekolah Mitra',
        quote: 'Kami melihat OMATIQ sebagai ajang yang rapi dan membangun. Anak-anak belajar berkompetisi tanpa kehilangan semangat belajar.',
        avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80',
        rating: 5,
    },
    {
        id: 6,
        name: 'Daffa Mahendra',
        role: 'Finalis OMATIQ',
        quote: 'Soalnya menantang, tapi seru. Saya jadi ingin latihan lagi supaya bisa lebih siap di babak berikutnya.',
        avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=300&q=80',
        rating: 5,
    },
];

export const partners = [
    'Sekolah Mitra',
    'TPQ Mitra',
    'Komunitas Guru',
    'Orang Tua',
    'Mentor Daerah',
    'Final Nasional',
];

export const categories = [
    'All',
    "Al-Qur'an",
    'Matematika',
    'Persiapan',
    'Nasional',
];
