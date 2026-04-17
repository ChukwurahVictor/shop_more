import {
    type ChangeEvent,
    type FC,
    type FormEvent,
    useState,
    useMemo,
} from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../context/AuthContext";

const RegisterPage: FC = () => {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const policy = useMemo(
        () => ({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[^A-Za-z0-9]/.test(password),
        }),
        [password],
    );

    const policyPassed = Object.values(policy).every(Boolean);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError(null);
        if (!policyPassed) {
            setPasswordTouched(true);
            setError("Password does not meet the requirements below.");
            return;
        }
        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }
        setSubmitting(true);
        try {
            await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            navigate("/", { replace: true });
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                const errors = err.response?.data?.errors as
                    | Record<string, string[]>
                    | undefined;
                const firstField = errors
                    ? Object.values(errors)[0]?.[0]
                    : undefined;
                const msg =
                    firstField ??
                    err.response?.data?.message ??
                    "Registration failed. Please try again.";
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
                    Create your account
                </h1>
                <p className="mb-7 text-sm text-gray-500 leading-relaxed">
                    Join and start earning achievements with every purchase.
                </p>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex flex-col gap-[18px]"
                >
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="name"
                            className="text-[13px] font-semibold text-gray-700"
                        >
                            Full name
                        </label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setName(e.target.value)
                            }
                            className="w-full px-3.5 py-[11px] text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none transition-colors duration-150 focus:border-brand disabled:opacity-50"
                            placeholder="Jane Doe"
                            disabled={submitting}
                        />
                    </div>

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
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setPassword(e.target.value);
                                setPasswordTouched(true);
                            }}
                            className="w-full px-3.5 py-[11px] text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none transition-colors duration-150 focus:border-brand disabled:opacity-50"
                            placeholder="Min. 8 characters"
                            disabled={submitting}
                        />
                        {passwordTouched && (
                            <ul
                                className="mt-1.5 flex flex-col gap-1 pl-0 list-none m-0"
                                aria-label="Password requirements"
                            >
                                {(
                                    [
                                        [
                                            policy.length,
                                            "At least 8 characters",
                                        ],
                                        [
                                            policy.uppercase,
                                            "One uppercase letter (A–Z)",
                                        ],
                                        [
                                            policy.lowercase,
                                            "One lowercase letter (a–z)",
                                        ],
                                        [policy.number, "One number (0–9)"],
                                        [
                                            policy.symbol,
                                            "One special character (!@#$…)",
                                        ],
                                    ] as [boolean, string][]
                                ).map(([met, label]) => (
                                    <li
                                        key={label}
                                        className="flex items-center gap-1.5 text-[12px] font-medium"
                                    >
                                        <span
                                            className={
                                                met
                                                    ? "text-brand"
                                                    : "text-gray-400"
                                            }
                                        >
                                            {met ? "✓" : "○"}
                                        </span>
                                        <span
                                            className={
                                                met
                                                    ? "text-brand"
                                                    : "text-gray-400"
                                            }
                                        >
                                            {label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password-confirm"
                            className="text-[13px] font-semibold text-gray-700"
                        >
                            Confirm password
                        </label>
                        <input
                            id="password-confirm"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={passwordConfirmation}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setPasswordConfirmation(e.target.value)
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
                        {submitting ? "Creating account…" : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-[13px] text-gray-500">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-brand font-semibold no-underline hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
