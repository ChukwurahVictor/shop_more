import { type ChangeEvent, type FC, type FormEvent, type CSSProperties, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';

const RegisterPage: FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
        const firstField = errors ? Object.values(errors)[0]?.[0] : undefined;
        const msg =
          firstField ??
          err.response?.data?.message ??
          'Registration failed. Please try again.';
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
                  <span style={styles.brandName}>ShopMore Rewards</span>
              </div>

              <h1 style={styles.heading}>Create your account</h1>
              <p style={styles.subheading}>
                  Join and start earning achievements with every purchase.
              </p>

              <form onSubmit={handleSubmit} noValidate style={styles.form}>
                  <div style={styles.fieldGroup}>
                      <label htmlFor="name" style={styles.label}>
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
                          style={styles.input}
                          placeholder="Jane Doe"
                          disabled={submitting}
                      />
                  </div>

                  <div style={styles.fieldGroup}>
                      <label htmlFor="email" style={styles.label}>
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
                          style={styles.input}
                          placeholder="you@example.com"
                          disabled={submitting}
                      />
                  </div>

                  <div style={styles.fieldGroup}>
                      <label htmlFor="password" style={styles.label}>
                          Password
                      </label>
                      <input
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          required
                          value={password}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setPassword(e.target.value)
                          }
                          style={styles.input}
                          placeholder="Min. 8 characters"
                          disabled={submitting}
                      />
                  </div>

                  <div style={styles.fieldGroup}>
                      <label htmlFor="password-confirm" style={styles.label}>
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
                          style={styles.input}
                          placeholder="••••••••"
                          disabled={submitting}
                      />
                  </div>

                  {error && (
                      <p
                          style={styles.errorMsg}
                          role="alert"
                          aria-live="assertive"
                      >
                          {error}
                      </p>
                  )}

                  <button
                      type="submit"
                      style={{
                          ...styles.submitBtn,
                          ...(submitting ? styles.submitBtnDisabled : {}),
                      }}
                      disabled={submitting}
                      aria-busy={submitting}
                  >
                      {submitting ? "Creating account…" : "Create account"}
                  </button>
              </form>

              <p style={styles.switchText}>
                  Already have an account?{" "}
                  <Link to="/login" style={styles.switchLink}>
                      Sign in
                  </Link>
              </p>
          </div>
      </div>
  );
};

export default RegisterPage;

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
