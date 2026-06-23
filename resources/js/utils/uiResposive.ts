import { useMediaQuery } from "@/hooks/use-media-query";

export const useResponsiveVisibleCount = (desktopCount: number) => {
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const isTablet = useMediaQuery('(min-width: 768px)');

    if (isDesktop) {
        return desktopCount;
    }

    return isTablet ? Math.min(2, desktopCount) : 1;
};

export const getVisibleItems = <T,>(
    items: T[],
    startIndex: number,
    visibleCount: number,
) => {
    if (items.length <= visibleCount) {
        return items;
    }

    return Array.from({ length: visibleCount }).map(
        (_, offset) => items[(startIndex + offset) % items.length],
    );
};
