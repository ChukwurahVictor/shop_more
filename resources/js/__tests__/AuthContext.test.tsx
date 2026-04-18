import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth';
import { TOKEN_KEY } from '../api/client';

vi.mock('../api/auth');
vi.mock('../api/client', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../api/client')>();
    return { ...actual, setOnUnauthorized: vi.fn() };
});

const mockApiLogin = vi.mocked(apiLogin);
const mockApiLogout = vi.mocked(apiLogout);
const mockApiRegister = vi.mocked(apiRegister);

const USER_KEY = 'shopmore_user';

function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(AuthProvider, null, children);
}

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('starts unauthenticated with no stored session', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('rehydrates user from localStorage on mount', () => {
        const user = { id: 1, name: 'Test', email: 'test@example.com' };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, 'abc');
        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current.user).toEqual(user);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('login sets user in state and stores token', async () => {
        const authResponse = {
            token: 'tok123',
            user: { id: 2, name: 'Alice', email: 'alice@example.com' },
        };
        mockApiLogin.mockResolvedValueOnce(authResponse);
        const { result } = renderHook(() => useAuth(), { wrapper });
        await act(async () => {
            await result.current.login({ email: 'alice@example.com', password: 'pass' });
        });
        expect(result.current.user).toEqual(authResponse.user);
        expect(result.current.isAuthenticated).toBe(true);
        expect(localStorage.getItem(TOKEN_KEY)).toBe('tok123');
        expect(localStorage.getItem(USER_KEY)).toBe(JSON.stringify(authResponse.user));
    });

    it('register sets user in state', async () => {
        const authResponse = {
            token: 'reg-tok',
            user: { id: 3, name: 'Bob', email: 'bob@example.com' },
        };
        mockApiRegister.mockResolvedValueOnce(authResponse);
        const { result } = renderHook(() => useAuth(), { wrapper });
        await act(async () => {
            await result.current.register({
                name: 'Bob',
                email: 'bob@example.com',
                password: 'Pass1!',
                password_confirmation: 'Pass1!',
            });
        });
        expect(result.current.user).toEqual(authResponse.user);
        expect(localStorage.getItem(TOKEN_KEY)).toBe('reg-tok');
    });

    it('logout clears user from state and storage', async () => {
        const user = { id: 1, name: 'Test', email: 'test@example.com' };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, 'abc');
        mockApiLogout.mockResolvedValueOnce(undefined);
        const { result } = renderHook(() => useAuth(), { wrapper });
        await act(async () => {
            await result.current.logout();
        });
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        expect(localStorage.getItem(USER_KEY)).toBeNull();
    });

    it('logout clears state locally even if the API call fails', async () => {
        const user = { id: 1, name: 'Test', email: 'test@example.com' };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, 'abc');
        mockApiLogout.mockRejectedValueOnce(new Error('Network'));
        const { result } = renderHook(() => useAuth(), { wrapper });
        await act(async () => {
            await result.current.logout();
        });
        expect(result.current.user).toBeNull();
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
});
