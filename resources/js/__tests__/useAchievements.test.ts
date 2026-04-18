import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { type ReactNode } from 'react';
import { useAchievements } from '../hooks/useAchievements';
import { fetchAchievements } from '../api/achievements';

vi.mock('../api/achievements');
vi.mock('../api/client', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../api/client')>();
    return { ...actual, setOnUnauthorized: vi.fn() };
});

const mockFetchAchievements = vi.mocked(fetchAchievements);

function makeWrapper() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return React.createElement(QueryClientProvider, { client: qc }, children);
    };
}

const mockData = {
    unlocked_achievements: ['First Steps'],
    next_available_achievements: ['Regular Shopper'],
    current_badge: 'Bronze' as const,
    next_badge: 'Silver' as const,
    remaining_to_unlock_next_badge: 4,
    total_purchases: 1,
};

describe('useAchievements', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns data on success', async () => {
        mockFetchAchievements.mockResolvedValueOnce(mockData);
        const { result } = renderHook(() => useAchievements(1), {
            wrapper: makeWrapper(),
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(mockData);
        expect(result.current.isError).toBe(false);
    });

    it('sets isError on API failure', async () => {
        // The hook has retry: 2 with exponential backoff (~1s + ~2s = ~3s).
        // Increase the waitFor timeout to allow all retries to complete.
        mockFetchAchievements.mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useAchievements(1), {
            wrapper: makeWrapper(),
        });
        await waitFor(
            () => {
                expect(result.current.isLoading).toBe(false);
                expect(result.current.isError).toBe(true);
            },
            { timeout: 10000 },
        );
        expect(result.current.data).toBeUndefined();
    });

    it('does not fetch when userId is 0 (falsy)', () => {
        const { result } = renderHook(() => useAchievements(0), {
            wrapper: makeWrapper(),
        });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeUndefined();
        expect(mockFetchAchievements).not.toHaveBeenCalled();
    });

    it('refetch re-calls the API', async () => {
        mockFetchAchievements.mockResolvedValue(mockData);
        const { result } = renderHook(() => useAchievements(1), {
            wrapper: makeWrapper(),
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        await result.current.refetch();
        expect(mockFetchAchievements).toHaveBeenCalledTimes(2);
    });
});
