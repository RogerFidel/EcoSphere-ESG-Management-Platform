import React from 'react';
import { useToastStore } from '../../store';

const TOAST_STYLES = {
  success: { color: 'var(--clr-green-400)', icon: '✅' },
  error:   { color: 'var(--clr-rose-400)',  icon: '❌' },
  info:    { color: 'var(--clr-blue-400)',  icon: 'ℹ️' },
  warning: { color: 'var(--clr-amber-400)', icon: '⚠️' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        return (
          <div
            key={toast.id}
            className="toast animate-in"
            style={{ '--toast-color': style.color }}
            role="alert"
          >
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{style.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && <div className="toast-title">{toast.title}</div>}
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: 'var(--txt-muted)', fontSize: '1.1rem', flexShrink: 0, lineHeight: 1, padding: '2px' }}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
