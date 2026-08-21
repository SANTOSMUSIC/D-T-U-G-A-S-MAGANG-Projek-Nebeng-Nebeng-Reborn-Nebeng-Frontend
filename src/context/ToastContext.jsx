import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const VARIANT_STYLES = {
  success: {
    icon: CheckCircle2,
    iconWrap: 'bg-emerald-50 text-emerald-600',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    iconWrap: 'bg-rose-50 text-rose-600',
    bar: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: 'bg-amber-50 text-amber-600',
    bar: 'bg-amber-500',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-purple-50 text-purple-600',
    bar: 'bg-purple-500',
  },
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const { variant = 'info', title, duration = 4000 } = options;
    const id = ++idCounter;

    setToasts((current) => [...current, { id, message, variant, title }]);

    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismissToast(id), duration);
    }
    return id;
  }, [dismissToast]);

  const toast = {
    show: showToast,
    success: (message, options) => showToast(message, { ...options, variant: 'success' }),
    error: (message, options) => showToast(message, { ...options, variant: 'error' }),
    warning: (message, options) => showToast(message, { ...options, variant: 'warning' }),
    info: (message, options) => showToast(message, { ...options, variant: 'info' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Viewport toast: fixed di kanan-atas, stack ke bawah */}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => {
          const style = VARIANT_STYLES[t.variant] || VARIANT_STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto relative overflow-hidden bg-white rounded-2xl shadow-xl border border-neutral-100 flex items-start gap-3 p-4 pr-10 animate-in slide-in-from-top-2 fade-in duration-200"
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconWrap}`}>
                <Icon className="w-4.5 h-4.5" size={18} />
              </div>
              <div className="min-w-0 pt-0.5">
                {t.title && (
                  <p className="text-sm font-bold text-neutral-900 leading-snug">{t.title}</p>
                )}
                <p className="text-sm text-neutral-600 leading-snug whitespace-pre-line">{t.message}</p>
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                aria-label="Tutup notifikasi"
                className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  }
  return ctx;
}
