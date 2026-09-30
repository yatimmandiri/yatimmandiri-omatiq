import { DataTableComponent } from '@/components/partials/dataTables';
import { DataTableProvider } from '@/components/partials/dataTables/hooks/useDataTables';
import { renderRowHeader } from '@/components/partials/dataTables/utils/dataTable-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/teacher';
import sanggar from '@/routes/teacher/data-sanggar';
import { router } from '@inertiajs/react';
import { Building2, Eye, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

export default function ListPage() {
    const [refreshData, setRefreshData] = useState(false);
    const columns = [
        {
            header: (info: any) => renderRowHeader(info, 'Nama Sanggar'),
            accessorKey: 'name',
            cell: (info: any) => {
                const row = info.row.original;
                const name = info.getValue() ?? '-';
                const initial = String(name).charAt(0).toUpperCase();
                const targetId = row.id ?? row.sanggar_id;

                return (
                    <button
                        type="button"
                        onClick={() =>
                            targetId != null &&
                            router.visit(sanggar.show(targetId).url)
                        }
                        className="group flex items-center gap-3 rounded-xl text-left transition hover:opacity-90"
                        title={`Lihat detail ${name}`}
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#17524A]/10 text-sm font-bold text-[#17524A] transition group-hover:bg-[#17524A] group-hover:text-white dark:bg-[#17524A]/20 dark:text-emerald-300">
                            {initial}
                        </span>
                        <span className="font-semibold underline-offset-4 group-hover:underline">
                            {name}
                        </span>
                    </button>
                );
            },
        },
        {
            header: 'Tipe',
            accessorKey: 'type',
            cell: (info: any) => {
                const v = info.getValue();

                if (!v) {
                    return <span className="text-muted-foreground">-</span>;
                }

                return (
                    <Badge
                        variant="outline"
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                    >
                        {v}
                    </Badge>
                );
            },
        },
        {
            header: 'Kantor',
            accessorKey: 'kantor_name',
            cell: (info: any) =>
                info.getValue() ?? (
                    <span className="text-muted-foreground">-</span>
                ),
        },
        {
            header: 'Total Santri',
            accessorKey: 'total_students',
            cell: (info: any) => {
                const v = info.getValue();

                return (
                    <Badge className="gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white">
                        <Users className="size-3" />
                        {v ?? 0} Santri
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: (info: any) => {
                const row = info.row.original;
                const targetId = row.id ?? row.sanggar_id;

                return (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={targetId == null}
                        onClick={() =>
                            targetId != null &&
                            router.visit(sanggar.show(targetId).url)
                        }
                        className="gap-1.5"
                    >
                        <Eye className="size-4" />
                        Detail
                    </Button>
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-5 p-4 lg:p-6">
            <div>
                <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#17524A] text-white shadow-sm">
                        <Building2 className="size-5" />
                    </span>
                    Data Sanggar
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Daftar sanggar binaan yang terhubung dengan akun guru Anda
                    melalui Penyaluran. Data bersifat read-only.
                </p>
            </div>

            <Card className="flex items-start gap-3 rounded-2xl border-sky-200/50 bg-sky-50/60 px-4 py-3 dark:border-sky-900/30 dark:bg-sky-950/20">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sky-700 dark:text-sky-400" />
                <p className="text-xs leading-relaxed text-sky-900 dark:text-sky-200">
                    <span className="font-semibold">Info:</span> Data sanggar
                    berasal dari Penyaluran dan tidak dapat diubah di OMATIQ.
                    Hubungi admin Penyaluran jika ada ketidaksesuaian alamat
                    atau jumlah santri.
                </p>
            </Card>

            <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                <DataTableProvider
                    columns={columns}
                    filterValue={{}}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    urlFetchData={sanggar.data().url}
                    formatDataExport={(data: any[]) =>
                        data.map((item: any, index: number) => ({
                            No: index + 1,
                            'Nama Sanggar': item.name ?? '-',
                            Tipe: item.type ?? '-',
                            Kantor: item.kantor_name ?? '-',
                            'Total Santri': item.total_students ?? 0,
                        }))
                    }
                >
                    <DataTableComponent buttonActive={{ create: false }} />
                </DataTableProvider>
            </div>
        </div>
    );
}

ListPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Data Sanggar', href: sanggar.index().url },
    ],
};
