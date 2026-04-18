import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../api/client', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../api/client')>();
    return { ...actual, setOnUnauthorized: vi.fn() };
});

const USER_KEY = 'shopmore_user';
const TOKEN_KEY = 'shopmore_token';

function renderWithAuth(isLoggedIn: boolean, initialPath = '/') {
    if (isLoggedIn) {
        localStorage.setItem(
            USER_KEY,
            JSON.stringify({ id: 1, name: 'Test', email: 'test@example.com' }),
        );
        localStorage.setItem(TOKEN_KEY, 'abc');
    }
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <AuthProvider>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<div>Protected Content</div>} />
                    </Route>
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>,
    );
}

describe('ProtectedRoute', () => {
    beforeEach(() => localStorage.clear());

    it('renders the protected content when authenticated', () => {
        renderWithAuth(true);
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to /login when not authenticated', () => {
        renderWithAuth(false);
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
