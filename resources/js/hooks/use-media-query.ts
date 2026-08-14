import { useSyncExternalStore } from 'react';

const subscribeToMedia =
    (query: string) => (onStoreChange: () => void) => {
        const media = window.matchMedia(query);

        media.addEventListener('change', onStoreChange);

        return () => media.removeEventListener('change', onStoreChange);
    };

const getMediaSnapshot =
    (query: string) => () => window.matchMedia(query).matches;

export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        subscribeToMedia(query),
        getMediaSnapshot(query),
        () => false,
    );
}
