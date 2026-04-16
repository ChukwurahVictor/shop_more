import type { FC, CSSProperties } from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

const ErrorState: FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div style={styles.wrapper} role="alert" aria-live="assertive">
    <div style={styles.iconWrapper} aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke="#f87171" strokeWidth="2.5" />
        <path d="M24 14v13" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="33" r="2" fill="#f87171" />
      </svg>
    </div>

    <h2 style={styles.heading}>Something went wrong</h2>

    <p style={styles.message}>
      {message ??
        "We couldn\u2019t load your achievements. Please check that the backend is running and try again."}
    </p>

    <button style={styles.button} onClick={onRetry} type="button">
      Try again
    </button>
  </div>
);

export default ErrorState;

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: '16px',
    textAlign: 'center',
    background: '#ffffff',
    border: '1px solid #ebebeb',
    borderRadius: '12px',
  },
  iconWrapper: {
    marginBottom: '8px',
  },
  heading: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  message: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    maxWidth: '360px',
    lineHeight: 1.6,
  },
  button: {
    marginTop: '8px',
    padding: '10px 24px',
    background: '#1d9e75',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 200ms ease, transform 200ms ease',
    fontFamily: 'inherit',
  },
};
