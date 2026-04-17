import { type ChangeEvent, type FC, type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface LocationState {
    from?: { pathname: string };
}

const LoginPage: FC = () => {
    const { login, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as LocationState)?.from?.pathname ?? "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
                            className="w-full px-3.5 py-[11px] text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none transition-colors duration-150 focus:border-brand disabled:opacity-50"
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
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setPassword(e.target.value)
                            }
                            className="w-full px-3.5 py-[11px] text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none transition-colors duration-150 focus:border-brand disabled:opacity-50"
                            placeholder="••••••••"
                            disabled={submitting}
                        />
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
