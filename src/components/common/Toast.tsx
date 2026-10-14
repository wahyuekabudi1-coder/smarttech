import React from 'react';

export interface ToastData {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-white rounded-xl border border-neutral-border p-4 shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <span
            className={`material-symbols-outlined text-xl shrink-0 ${
              t.type === 'error'
                ? 'text-rose-500'
                : t.type === 'info'
                ? 'text-blue'
                : 'text-emerald-500'
            }`}
          >
            {t.type === 'error' ? 'error' : t.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-bold text-sm text-navy">{t.title}</h4>
            <p className="text-xs text-neutral-muted mt-0.5 leading-relaxed">{t.message}</p>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-neutral-muted hover:text-navy cursor-pointer p-0.5"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
