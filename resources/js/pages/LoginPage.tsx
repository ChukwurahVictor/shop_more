import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";

interface LocationState {
    from?: { pathname: string };
}

const EyeIcon: FC<{ visible: boolean }> = ({ visible }) =>
    visible ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

const LoginPage: FC = () => {
    const { login, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as LocationState)?.from?.pathname ?? "/";

    usePageTitle("Sign in");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login({ email, password });
            toast("Welcome back!", "success");
            navigate(from, { replace: true });
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                const msg =
                    err.response?.data?.message ??
                    err.response?.data?.errors?.email?.[0] ??
                    "Login failed. Please check your credentials.";
                setError(msg);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    const inputClass =
        "w-full px-3.5 py-[11px] text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none transition-colors duration-150 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-gray-50 to-amber-50 px-4 py-6">
            <div className="w-full max-w-[420px] bg-white rounded-2xl px-9 py-10 shadow-lg border border-gray-200">
                {/* Brand */}
                <div className="flex items-center gap-2.5 mb-7">
                    <div className="flex items-center justify-center">
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 28 28"
                            fill="none"
                            aria-hidden="true"
                        >
                            <circle cx="14" cy="14" r="14" fill="#1d9e75" />
                            <path
                                d="M8 14.5l4 4 8-8"
                                stroke="#fff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <span className="text-[17px] font-bold text-gray-900 tracking-tight">
                        ShopMore Rewards
                    </span>
                </div>

                <h1 className="mb-1.5 text-2xl font-bold text-gray-900 tracking-tight">
                    Welcome back
                </h1>
                <p className="mb-7 text-sm text-gray-500 leading-relaxed">
                    Sign in to view your achievements and loyalty progress.
                </p>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex flex-col gap-[18px]"
                >
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-[13px] font-semibold text-gray-700"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setEmail(e.target.value)
                            }
                            className={inputClass}
                            placeholder="you@example.com"
                            disabled={submitting}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-[13px] font-semibold text-gray-700"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setPassword(e.target.value)
                                }
                                className={`${inputClass} pr-10`}
                                placeholder="••••••••"
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150 bg-transparent border-0 cursor-pointer p-0"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                            >
                                <EyeIcon visible={showPassword} />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p
                            className="m-0 px-3.5 py-2.5 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg"
                            role="alert"
                            aria-live="assertive"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="mt-1 py-3 text-[15px] font-semibold bg-brand text-white border-none rounded-lg cursor-pointer transition-all duration-150 w-full hover:brightness-110 disabled:opacity-65 disabled:cursor-not-allowed"
                        disabled={submitting}
                        aria-busy={submitting}
                    >
                        {submitting ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-[13px] text-gray-500">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-brand font-semibold no-underline hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
