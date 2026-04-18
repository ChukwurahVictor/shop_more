import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-gray-50 to-amber-50 p-6 font-sans">
          <div className="w-full max-w-[460px] bg-white rounded-2xl px-9 py-12 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#ebebeb]">
            <div className="flex justify-center mb-6" aria-hidden="true">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" stroke="#f87171" strokeWidth="2.5" />
                <path d="M28 16v16" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="28" cy="40" r="2.5" fill="#f87171" />
              </svg>
            </div>
            <h1 className="m-0 mb-3 text-xl font-bold text-[#1a1a1a] text-center">Something went wrong</h1>
            <p className="m-0 mb-5 text-sm text-[#555] leading-relaxed text-center">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="mb-5 px-4 py-3 text-xs text-[#c0392b] bg-red-50 rounded-lg overflow-auto border border-red-100">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 text-sm font-semibold bg-brand text-white border-0 rounded-lg cursor-pointer font-sans hover:brightness-95 transition-all duration-150"
                onClick={() => window.location.reload()}
                type="button"
              >
                Refresh page
              </button>
              <button
                className="flex-1 py-2.5 text-sm font-semibold bg-white text-[#555] border border-[#ddd] rounded-lg cursor-pointer font-sans hover:bg-gray-50 transition-all duration-150"
                onClick={this.handleReset}
                type="button"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0fdf8 0%, #f8f8f6 60%, #fef9ec 100%)',
    padding: '24px 16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '48px 36px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #ebebeb',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
  icon: { marginBottom: '8px' },
  heading: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  message: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.6,
    maxWidth: '340px',
  },
  detail: {
    margin: 0,
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#b91c1c',
    maxWidth: '100%',
    overflow: 'auto',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  primaryBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    background: '#1d9e75',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  secondaryBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    background: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
