import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, ExternalLink } from 'lucide-react';

export function ProofModal({
    href,
    open,
    onOpenChange,
    title = 'Bukti Pembayaran',
}: {
    href: string;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title?: string;
}) {
    const isPdf = href?.toLowerCase().endsWith('.pdf');
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    // Reset zoom dan rotasi setiap kali modal dibuka atau URL berubah
    useEffect(() => {
        if (open) {
            setScale(1);
            setRotation(0);
        }
    }, [open, href]);

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 4));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleReset = () => {
        setScale(1);
        setRotation(0);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (isPdf) return;
        if (e.deltaY < 0) {
            setScale((prev) => Math.min(prev + 0.15, 4));
        } else {
            setScale((prev) => Math.max(prev - 0.15, 0.5));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] w-[95vw] max-w-5xl overflow-hidden p-4 sm:p-6">
                <DialogHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2 pr-6">
                    <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
                    {!isPdf && href && (
                        <div className="flex items-center gap-1.5 rounded-lg border bg-muted/60 p-1 shadow-sm">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-xs hover:bg-background"
                                onClick={handleZoomOut}
                                disabled={scale <= 0.5}
                                title="Perkecil (Zoom Out)"
                            >
                                <ZoomOut className="size-4" />
                            </Button>
                            <Badge variant="outline" className="px-2 py-0.5 font-mono text-xs">
                                {Math.round(scale * 100)}%
                            </Badge>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-xs hover:bg-background"
                                onClick={handleZoomIn}
                                disabled={scale >= 4}
                                title="Perbesar (Zoom In)"
                            >
                                <ZoomIn className="size-4" />
                            </Button>
                            <div className="mx-0.5 h-4 w-px bg-border" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-xs hover:bg-background"
                                onClick={handleRotate}
                                title="Putar Gambar (Rotate)"
                            >
                                <RotateCw className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-xs hover:bg-background"
                                onClick={handleReset}
                                title="Reset Ukuran"
                            >
                                <RotateCcw className="size-4" />
                            </Button>
                            <div className="mx-0.5 h-4 w-px bg-border" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-xs hover:bg-background"
                                asChild
                                title="Buka Gambar di Tab Baru"
                            >
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="size-4" />
                                </a>
                            </Button>
                        </div>
                    )}
                </DialogHeader>

                {isPdf ? (
                    <iframe src={href} className="h-[78vh] w-full rounded-lg border shadow-inner" title="Bukti Pembayaran PDF" />
                ) : (
                    <div
                        className="relative flex h-[75vh] w-full items-center justify-center overflow-auto rounded-lg border bg-zinc-900/90 p-4 shadow-inner"
                        onWheel={handleWheel}
                    >
                        <div
                            className="flex items-center justify-center transition-transform duration-200 ease-out"
                            style={{
                                transform: `scale(${scale}) rotate(${rotation}deg)`,
                                transformOrigin: 'center center',
                            }}
                        >
                            <img
                                src={href}
                                alt="Bukti Pembayaran"
                                className="max-h-[70vh] max-w-full rounded object-contain shadow-2xl select-none"
                                draggable={false}
                            />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

