import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import RegisterPage from '../pages/RegisterPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { register as apiRegister } from '../api/auth';

vi.mock('../api/auth');
vi.mock('../api/client', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../api/client')>();
    return { ...actual, setOnUnauthorized: vi.fn() };
});

const mockApiRegister = vi.mocked(apiRegister);

function renderRegisterPage() {
    const qc = new QueryClient();
    return render(
        <QueryClientProvider client={qc}>
            <MemoryRouter>
                <ToastProvider>
                    <AuthProvider>
                        <RegisterPage />
                    </AuthProvider>
                </ToastProvider>
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe('RegisterPage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('renders all four registration fields', () => {
        renderRegisterPage();
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    });

    it('blocks submission and shows error when password does not meet policy', async () => {
        const user = userEvent.setup();
        renderRegisterPage();
        await user.type(screen.getByLabelText(/full name/i), 'Test User');
        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'weak');
        await user.type(screen.getByLabelText('Confirm password'), 'weak');
        await user.click(screen.getByRole('button', { name: /create account/i }));
        await waitFor(() =>
            expect(screen.getByRole('alert')).toHaveTextContent(/password does not meet/i),
        );
        expect(mockApiRegister).not.toHaveBeenCalled();
    });

    it('blocks submission when passwords do not match', async () => {
        const user = userEvent.setup();
        renderRegisterPage();
        await user.type(screen.getByLabelText(/full name/i), 'Test User');
        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'StrongPass1!');
        await user.type(screen.getByLabelText('Confirm password'), 'Different1!');
        await user.click(screen.getByRole('button', { name: /create account/i }));
        await waitFor(() =>
            expect(screen.getByRole('alert')).toHaveTextContent(/passwords do not match/i),
        );
        expect(mockApiRegister).not.toHaveBeenCalled();
    });

    it('calls the register API when all fields are valid', async () => {
        const user = userEvent.setup();
        mockApiRegister.mockResolvedValueOnce({
            token: 'tok',
            user: { id: 1, name: 'Test User', email: 'test@example.com' },
        });
        renderRegisterPage();
        await user.type(screen.getByLabelText(/full name/i), 'Test User');
        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.type(screen.getByLabelText(/^password$/i), 'StrongPass1!');
        await user.type(screen.getByLabelText('Confirm password'), 'StrongPass1!');
        await user.click(screen.getByRole('button', { name: /create account/i }));
        await waitFor(() => expect(mockApiRegister).toHaveBeenCalledOnce());
        expect(mockApiRegister).toHaveBeenCalledWith({
            name: 'Test User',
            email: 'test@example.com',
            password: 'StrongPass1!',
            password_confirmation: 'StrongPass1!',
        });
    });

    it('shows password policy checklist after typing in the password field', async () => {
        const user = userEvent.setup();
        renderRegisterPage();
        await user.type(screen.getByLabelText(/^password$/i), 'a');
        expect(screen.getByLabelText(/password requirements/i)).toBeInTheDocument();
    });

    it('toggles password field visibility', async () => {
        const user = userEvent.setup();
        renderRegisterPage();
        const passwordInput = screen.getByLabelText(/^password$/i);
        expect(passwordInput).toHaveAttribute('type', 'password');
        await user.click(screen.getByRole('button', { name: /show password/i }));
        expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('sets document title to "Create account — ShopMore"', () => {
        renderRegisterPage();
        expect(document.title).toBe('Create account — ShopMore');
    });
});
