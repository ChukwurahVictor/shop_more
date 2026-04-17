import {
  createContext,
  useCallback,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const typeClasses: Record<ToastType, string> = {
  success: 'bg-emerald-800 border-l-4 border-l-emerald-400',
  error: 'bg-red-900 border-l-4 border-l-red-400',
  info: 'bg-[#1e3a5f] border-l-4 border-l-blue-400',
};

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-[9999] pointer-events-none max-w-[380px] w-full"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-3.5 rounded-[10px] text-white text-sm font-medium shadow-[0_8px_24px_rgba(0,0,0,0.2)] pointer-events-auto animate-toast-in ${typeClasses[t.type]}`}
            role="alert"
          >
            <span className="text-base font-bold shrink-0 w-[22px] h-[22px] flex items-center justify-center rounded-full bg-white/15">
              {typeIcons[t.type]}
            </span>
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              className="bg-transparent border-none text-white/60 text-xl cursor-pointer px-1 font-sans leading-none shrink-0 hover:text-white/90"
              onClick={() => dismiss(t.id)}
              type="button"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
