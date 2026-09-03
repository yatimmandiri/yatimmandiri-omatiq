import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;

const subscribe = (onStoreChange: () => void) => {
    if (typeof window === 'undefined') {
        return () => {};
    }
    const mql = window.matchMedia(
        `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    );

    mql.addEventListener('change', onStoreChange);

    return () => mql.removeEventListener('change', onStoreChange);
};

const getSnapshot = () => (typeof window === 'undefined' ? false : window.innerWidth < MOBILE_BREAKPOINT);

export function useIsMobile() {
    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
