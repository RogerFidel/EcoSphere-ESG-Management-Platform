import { create } from 'zustand';
import { authAPI } from '../api/client';

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('gq_user') || 'null'),
  token: localStorage.getItem('gq_token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authAPI.login({ email, password });
      localStorage.setItem('gq_token', token);
      localStorage.setItem('gq_user', JSON.stringify(user));
      set({ user, token, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authAPI.register(data);
      localStorage.setItem('gq_token', token);
      localStorage.setItem('gq_user', JSON.stringify(user));
      set({ user, token, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem('gq_token');
    localStorage.removeItem('gq_user');
    set({ user: null, token: null });
    authAPI.logout().catch(() => {});
  },

  refreshUser: async () => {
    try {
      const user = await authAPI.me();
      localStorage.setItem('gq_user', JSON.stringify(user));
      set({ user });
      return user;
    } catch (err) {
      get().logout();
    }
  },

  updateUser: (updates) => {
    const user = { ...get().user, ...updates };
    localStorage.setItem('gq_user', JSON.stringify(user));
    set({ user });
  },

  isAdmin: () => get().user?.role === 'admin',
  isManager: () => ['admin', 'manager'].includes(get().user?.role),
}));

// ─── Notification Store ────────────────────────────────────────────────────────
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  setNotifications: (notifications, unreadCount) => set({ notifications, unreadCount }),

  addNotification: (notif) => {
    set((state) => ({
      notifications: [notif, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + (notif.is_read ? 0 : 1),
    }));
  },

  markRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, is_read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },

  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  closePanel: () => set({ isOpen: false }),
}));

// ─── Toast Store ───────────────────────────────────────────────────────────────
let toastId = 0;
export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = ++toastId;
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 4000);
    return id;
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Helper hook
export const useToast = () => {
  const addToast = useToastStore((s) => s.addToast);
  return {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  };
};
