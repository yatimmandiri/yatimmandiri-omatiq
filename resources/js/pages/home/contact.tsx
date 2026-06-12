import { ContactForm, ContactInfoGrid, SectionHeader } from '@/components/marketing/marketing-components';
import { ChevronDown, MapPin } from 'lucide-react';

const faqs = [
    ['Bagaimana cara mendaftar program OMATIQ?', 'Kamu bisa mengirim pesan melalui form kontak. Tim kami akan membantu memilih program yang paling sesuai dengan kebutuhanmu.'],
    ['Apakah OMATIQ bisa bekerja sama dengan sekolah atau komunitas?', 'Bisa. Kami terbuka untuk kolaborasi program, kelas khusus, workshop, dan pengembangan komunitas.'],
    ['Apakah tersedia program online?', 'Ya. Beberapa program dapat dijalankan online, hybrid, maupun offline sesuai format dan kebutuhan peserta.'],
    ['Apakah program bisa disesuaikan?', 'Bisa. Kami dapat menyesuaikan topik, durasi, dan pendekatan pembelajaran untuk mitra tertentu.'],
];

export default function ContactPage() {
    return (
        <>
            <section className="px-5 py-16 md:py-24 lg:px-8">
                <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <span className="inline-flex rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">Contact</span>
                        <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-[#1E293B] md:text-6xl">Mari mulai percakapan yang baik.</h1>
                        <p className="mt-5 text-lg leading-8 text-[#64748B]">Punya rencana program, kolaborasi, kelas komunitas, atau ingin tahu lebih banyak tentang OMATIQ? Kami siap mendengar.</p>
                    </div>
                    <ContactInfoGrid />
                </div>
            </section>

            <section className="bg-white px-5 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
                    <div>
                        <SectionHeader eyebrow="Message Us" title="Ceritakan kebutuhanmu" description="Isi form ini dan tim OMATIQ akan menghubungi kamu dengan langkah lanjut yang jelas." align="left" />
                        <div className="mt-8">
                            <ContactForm />
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-[32px] bg-[#0F60AC] p-5 shadow-2xl shadow-[#0F60AC]/15">
                        <div className="relative flex h-full min-h-[520px] items-center justify-center overflow-hidden rounded-[28px] bg-[#F8FAFC]">
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80" alt="City map and location" className="absolute inset-0 h-full w-full object-cover opacity-70" />
                            <div className="relative max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F15F23] text-white">
                                    <MapPin className="h-8 w-8" />
                                </div>
                                <h2 className="mt-5 text-2xl font-black text-[#1E293B]">OMATIQ Hub</h2>
                                <p className="mt-3 text-sm leading-7 text-[#64748B]">Jakarta, Indonesia. Open for education programs, community partnerships, and creative collaborations.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <SectionHeader eyebrow="FAQ" title="Pertanyaan yang sering muncul" />
                    <div className="mt-10 space-y-4">
                        {faqs.map(([question, answer]) => (
                            <details key={question} className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 open:shadow-xl">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-[#1E293B]">
                                    {question}
                                    <ChevronDown className="h-5 w-5 shrink-0 text-[#F15F23] transition group-open:rotate-180" />
                                </summary>
                                <p className="mt-4 text-sm leading-7 text-[#64748B]">{answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
