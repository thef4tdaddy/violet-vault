import { create } from "zustand";

let toastId = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: ({ type = "info", title, message, duration = 5000 }) => {
    const id = ++toastId;
    const toast = {
      id,
      type,
      title,
      message,
      duration,
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Convenience methods for different toast types
  showSuccess: (message, title = "Success", duration = 5000) => {
    return get().addToast({ type: "success", title, message, duration });
  },

  showError: (message, title = "Error", duration = 8000) => {
    return get().addToast({ type: "error", title, message, duration });
  },

  showWarning: (message, title = "Warning", duration = 6000) => {
    return get().addToast({ type: "warning", title, message, duration });
  },

  showInfo: (message, title = "Info", duration = 5000) => {
    return get().addToast({ type: "info", title, message, duration });
  },

  showPayday: (message, title = "Payday", duration = 6000) => {
    return get().addToast({ type: "payday", title, message, duration });
  },
}));

// Global toast functions that can be called from anywhere
export const globalToast = {
  showSuccess: (message, title, duration) =>
    useToastStore.getState().showSuccess(message, title, duration),
  showError: (message, title, duration) =>
    useToastStore.getState().showError(message, title, duration),
  showWarning: (message, title, duration) =>
    useToastStore.getState().showWarning(message, title, duration),
  showInfo: (message, title, duration) =>
    useToastStore.getState().showInfo(message, title, duration),
  showPayday: (message, title, duration) =>
    useToastStore.getState().showPayday(message, title, duration),
};

export default useToastStore;
