import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { login as apiLogin } from '../api/auth';

vi.mock('../api/auth');
vi.mock('../api/client', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../api/client')>();
    return { ...actual, setOnUnauthorized: vi.fn() };
});

const mockApiLogin = vi.mocked(apiLogin);

function renderLoginPage() {
    const qc = new QueryClient();
    return render(
        <QueryClientProvider client={qc}>
            <MemoryRouter>
                <ToastProvider>
                    <AuthProvider>
                        <LoginPage />
                    </AuthProvider>
                </ToastProvider>
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe('LoginPage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('renders email, password fields and a sign-in button', () => {
        renderLoginPage();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows an error alert on failed login', async () => {
        const user = userEvent.setup();
        mockApiLogin.mockRejectedValueOnce({
            isAxiosError: true,
            response: { data: { message: 'Invalid credentials' }, status: 422 },
        });
        renderLoginPage();
        await user.type(screen.getByLabelText(/email address/i), 'bad@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'wrong');
        await user.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() =>
            expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials'),
        );
    });

    it('disables the submit button while the request is in flight', async () => {
        const user = userEvent.setup();
        // Never resolves — simulates a pending request
        mockApiLogin.mockImplementation(() => new Promise(() => {}));
        renderLoginPage();
        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'password');
        await user.click(screen.getByRole('button', { name: /sign in/i }));
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    it('toggles password field visibility when the eye button is clicked', async () => {
        const user = userEvent.setup();
        renderLoginPage();
        const passwordInput = screen.getByLabelText(/^password$/i);
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggle = screen.getByRole('button', { name: /show password/i });
        await user.click(toggle);
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(toggle).toHaveAccessibleName(/hide password/i);

        await user.click(toggle);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('sets document title to "Sign in — ShopMore"', () => {
        renderLoginPage();
        expect(document.title).toBe('Sign in — ShopMore');
    });
});
