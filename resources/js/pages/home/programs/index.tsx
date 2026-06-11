import { EmptyState, ProgramCard, SectionHeader } from '@/components/marketing/marketing-components';
import { categories, programs } from '@/components/marketing/site-data';
import { usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

type ProgramsProps = {
    programs?: typeof programs | { data?: typeof programs };
    categories?: string[];
};

const normalizePrograms = (value: ProgramsProps['programs']) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (value?.data && Array.isArray(value.data)) {
        return value.data;
    }

    return programs;
};

export default function ProgramsPage() {
    const props = usePage<ProgramsProps>().props;
    const sourcePrograms = normalizePrograms(props.programs);
    const sourceCategories = props.categories?.length ? ['All', ...props.categories] : categories;
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [page, setPage] = useState(1);
    const perPage = 6;

    const filteredPrograms = useMemo(() => {
        return sourcePrograms.filter((program) => {
            const matchesSearch = `${program.title} ${program.description} ${program.category}`.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === 'All' || program.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [category, search, sourcePrograms]);

    const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / perPage));
    const visiblePrograms = filteredPrograms.slice((page - 1) * perPage, page * perPage);

    const updateSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const updateCategory = (value: string) => {
        setCategory(value);
        setPage(1);
    };

    return (
        <>
            <section className="px-5 py-16 md:py-24 lg:px-8">
                <div className="mx-auto max-w-7xl rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-100 md:p-12">
                    <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
                        <div>
                            <span className="inline-flex rounded-full bg-[#F15F23]/10 px-4 py-2 text-sm font-black text-[#F15F23]">Olimpiade</span>
                            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-[#1E293B] md:text-6xl">Temukan program yang cocok untuk ritme belajarmu.</h1>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#64748B]">Jelajahi katalog OMATIQ berdasarkan minat, kategori, dan tujuan belajar komunitasmu.</p>
                        </div>
                        <img src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1000&q=80" alt="Program catalog learning moment" className="h-80 w-full rounded-3xl object-cover shadow-xl" />
                    </div>
                </div>
            </section>

            <section className="px-5 pb-16 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="sticky top-20 z-20 rounded-3xl bg-white p-4 shadow-xl shadow-[#0F60AC]/5 ring-1 ring-slate-100">
                        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                            <label className="relative block">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
                                <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search program..." className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] py-4 pl-12 pr-4 text-sm font-bold outline-none transition focus:border-[#F15F23] focus:bg-white" />
                            </label>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
                                <span className="hidden items-center gap-2 rounded-xl bg-[#0F60AC]/10 px-4 py-3 text-sm font-black text-[#0F60AC] lg:inline-flex"><SlidersHorizontal className="h-4 w-4" /> Filter</span>
                                {sourceCategories.map((item) => (
                                    <button key={item} type="button" onClick={() => updateCategory(item)} className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black transition ${category === item ? 'bg-[#F15F23] text-white shadow-lg shadow-[#F15F23]/20' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#0F60AC]/10 hover:text-[#0F60AC]'}`}>
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <SectionHeader eyebrow="Catalog" title="Olimpiade pilihan OMATIQ" description={`${filteredPrograms.length} program tersedia untuk dijelajahi.`} align="left" />
                        {visiblePrograms.length > 0 ? (
                            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {visiblePrograms.map((program) => <ProgramCard key={program.id} program={program} />)}
                            </div>
                        ) : (
                            <div className="mt-8"><EmptyState title="Program tidak ditemukan" description="Coba ubah kata kunci pencarian atau pilih kategori lain." /></div>
                        )}
                    </div>

                    {filteredPrograms.length > perPage && (
                        <div className="mt-12 flex items-center justify-center gap-3">
                            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0F60AC] disabled:opacity-40">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#1E293B] shadow-sm ring-1 ring-slate-100">Page {page} of {totalPages}</span>
                            <button type="button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0F60AC] disabled:opacity-40">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
