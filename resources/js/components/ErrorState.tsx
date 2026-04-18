import type { FC } from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

const ErrorState: FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div
    className="flex flex-col items-center justify-center px-6 py-12 gap-4 text-center bg-white border border-[#ebebeb] rounded-xl"
    role="alert"
    aria-live="assertive"
  >
    <div className="mb-2" aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke="#f87171" strokeWidth="2.5" />
        <path d="M24 14v13" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="33" r="2" fill="#f87171" />
      </svg>
    </div>

    <h2 className="m-0 text-xl font-bold text-[#1a1a1a]">Something went wrong</h2>

    <p className="m-0 text-sm text-[#666] max-w-[360px] leading-relaxed">
      {message ??
        "We couldn\u2019t load your achievements. Please check that the backend is running and try again."}
    </p>

    <button
      className="mt-2 px-6 py-2.5 bg-brand text-white border-0 rounded-lg text-sm font-semibold cursor-pointer transition-[background,transform] duration-200 font-sans hover:brightness-95"
      onClick={onRetry}
      type="button"
    >
      Try again
    </button>
  </div>
);

export default ErrorState;
