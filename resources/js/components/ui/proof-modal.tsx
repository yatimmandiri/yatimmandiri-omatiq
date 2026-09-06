import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ProofModal({
    href,
    open,
    onOpenChange,
}: {
    href: string;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const isPdf = href?.toLowerCase().endsWith('.pdf');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bukti Pembayaran</DialogTitle>
                </DialogHeader>
                {isPdf ? (
                    <iframe src={href} className="h-[70vh] w-full rounded-md border" title="Bukti Pembayaran PDF" />
                ) : (
                    <img src={href} alt="Bukti Pembayaran" className="max-h-[70vh] w-full rounded-md object-contain" />
                )}
            </DialogContent>
        </Dialog>
    );
}
