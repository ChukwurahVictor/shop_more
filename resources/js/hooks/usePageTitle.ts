import { useEffect } from 'react';

export function usePageTitle(title: string): void {
    useEffect(() => {
        const prev = document.title;
        document.title = `${title} — ShopMore`;
        return () => {
            document.title = prev;
        };
    }, [title]);
}
