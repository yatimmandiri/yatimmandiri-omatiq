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
    { label: 'Programs', href: '/programs' },
    { label: 'News', href: '/news' },
    { label: 'Contact', href: '/contact' },
];

export const programs: ProgramItem[] = [
    {
        id: 1,
        title: 'Creative Learning Lab',
        slug: 'creative-learning-lab',
        category: 'Digital Skills',
        description: 'Kelas eksploratif untuk membantu pelajar membangun kreativitas, literasi digital, dan portofolio karya nyata.',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        duration: '8 minggu',
        level: 'Pemula',
        benefits: ['Mentor praktisi', 'Project-based learning', 'Showcase karya'],
    },
    {
        id: 2,
        title: 'Community Builder Academy',
        slug: 'community-builder-academy',
        category: 'Community',
        description: 'Program penguatan komunitas untuk calon penggerak lokal dengan modul kepemimpinan, kolaborasi, dan dampak sosial.',
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
        duration: '6 minggu',
        level: 'Intermediate',
        benefits: ['Peer circle', 'Toolkit komunitas', 'Pendampingan aksi'],
    },
    {
        id: 3,
        title: 'Future Ready Classroom',
        slug: 'future-ready-classroom',
        category: 'Education',
        description: 'Pembelajaran modern untuk guru dan fasilitator agar kelas terasa lebih interaktif, ramah, dan relevan.',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        duration: '4 minggu',
        level: 'Semua level',
        benefits: ['Desain kelas', 'Aktivitas interaktif', 'Materi siap pakai'],
    },
];

export const news: NewsItem[] = [
    {
        id: 1,
        title: 'OMATIQ membuka ruang belajar kreatif untuk komunitas muda',
        slug: 'ruang-belajar-kreatif-komunitas-muda',
        category: 'Community',
        date: '10 Juni 2026',
        excerpt: 'Inisiatif baru ini dirancang untuk menghubungkan mentor, pelajar, dan komunitas lokal dalam satu ekosistem belajar yang menyenangkan.',
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
        author: 'OMATIQ Editorial',
        readTime: '4 min read',
    },
    {
        id: 2,
        title: 'Cara membuat kelas komunitas terasa hidup dan mudah diikuti',
        slug: 'kelas-komunitas-terasa-hidup',
        category: 'Insight',
        date: '4 Juni 2026',
        excerpt: 'Panduan praktis membangun sesi belajar yang aktif, inklusif, dan tetap terukur dampaknya.',
        image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
        author: 'Learning Team',
        readTime: '6 min read',
    },
    {
        id: 3,
        title: 'Kolaborasi mentor lokal mempercepat dampak pendidikan',
        slug: 'kolaborasi-mentor-lokal',
        category: 'Impact',
        date: '28 Mei 2026',
        excerpt: 'Saat mentor lokal diberi ruang, pembelajaran menjadi lebih dekat dengan kebutuhan peserta dan komunitas.',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
        author: 'Impact Team',
        readTime: '5 min read',
    },
];

export const testimonials: TestimonialItem[] = [
    {
        id: 1,
        name: 'Nadia Putri',
        role: 'Community Lead',
        quote: 'OMATIQ membuat belajar terasa ringan, tapi hasilnya serius. Tim kami jadi punya struktur dan energi baru.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        rating: 5,
    },
    {
        id: 2,
        name: 'Rafi Ananda',
        role: 'Student Creator',
        quote: 'Saya tidak hanya ikut kelas, saya benar-benar membangun karya dan bertemu teman belajar yang suportif.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        rating: 5,
    },
    {
        id: 3,
        name: 'Sinta Lestari',
        role: 'Teacher Facilitator',
        quote: 'Materinya mudah dibawa ke kelas. Anak-anak lebih aktif, dan saya punya banyak ide baru untuk mengajar.',
        avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=300&q=80',
        rating: 5,
    },
];

export const partners = ['EduBridge', 'KomunitasKita', 'BrightLab', 'YouthSpark', 'SkillHub', 'RuangAksi'];

export const categories = ['All', 'Education', 'Digital Skills', 'Community', 'Creative', 'Impact'];
