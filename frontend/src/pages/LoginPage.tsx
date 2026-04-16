import { type ChangeEvent, type FC, type FormEvent, type CSSProperties, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  from?: { pathname: string };
}

const LoginPage: FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const msg =
          err.response?.data?.message ??
          err.response?.data?.errors?.email?.[0] ??
          'Login failed. Please check your credentials.';
        setError(msg);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="14" fill="#1d9e75" />
              <path d="M8 14.5l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={styles.brandName}>Bumpa Rewards</span>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to view your achievements and loyalty progress.</p>

        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@example.com"
              disabled={submitting}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              disabled={submitting}
            />
          </div>

          {error && (
            <p style={styles.errorMsg} role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{ ...styles.submitBtn, ...(submitting ? styles.submitBtnDisabled : {}) }}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.switchLink}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0fdf8 0%, #f8f8f6 60%, #fef9ec 100%)',
    padding: '24px 16px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px 36px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #ebebeb',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
  },
  logoMark: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '-0.2px',
  },
  heading: {
    margin: '0 0 6px',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '-0.4px',
  },
  subheading: {
    margin: '0 0 28px',
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '11px 14px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    background: '#fafafa',
    color: '#1a1a1a',
    transition: 'border-color 150ms ease',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  errorMsg: {
    margin: 0,
    padding: '10px 14px',
    fontSize: '13px',
    color: '#b91c1c',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
  },
  submitBtn: {
    marginTop: '4px',
    padding: '13px',
    fontSize: '15px',
    fontWeight: '600',
    background: '#1d9e75',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'filter 150ms ease',
    width: '100%',
  },
  submitBtnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  switchText: {
    marginTop: '24px',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#666',
  },
  switchLink: {
    color: '#1d9e75',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
