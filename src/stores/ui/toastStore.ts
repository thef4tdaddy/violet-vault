import { create } from "zustand";

let toastId = 0;

/**
 * Toast type
 */
type ToastType = "info" | "success" | "error" | "warning" | "payday";

/**
 * Toast object
 */
interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

/**
 * Toast options for adding a toast
 */
interface AddToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

/**
 * Toast store state
 */
interface ToastState {
  toasts: Toast[];
  addToast: (options: AddToastOptions) => number;
  removeToast: (id: number) => void;
  clearAllToasts: () => void;
  showSuccess: (message: string, title?: string, duration?: number) => number;
  showError: (message: string, title?: string, duration?: number) => number;
  showWarning: (message: string, title?: string, duration?: number) => number;
  showInfo: (message: string, title?: string, duration?: number) => number;
  showPayday: (message: string, title?: string, duration?: number) => number;
}

export const useToastStore = create<ToastState>((set, _get) => {
  const store: ToastState = {
    toasts: [],

    addToast: ({ type = "info", title, message, duration = 5000 }: AddToastOptions) => {
      const id = ++toastId;
      const toast: Toast = {
        id,
        type,
        title,
        message,
        duration,
      };

      set(
        (state: ToastState): ToastState => ({
          ...state,
          toasts: [...state.toasts, toast],
        })
      );

      // Auto-remove toast after duration using external store reference
      if (duration > 0) {
        setTimeout(() => {
          useToastStore.getState().removeToast(id);
        }, duration);
      }

      return id;
    },

    removeToast: (id: number) => {
      set(
        (state: ToastState): ToastState => ({
          ...state,
          toasts: state.toasts.filter((toast) => toast.id !== id),
        })
      );
    },

    clearAllToasts: () => {
      set((state) => ({ ...state, toasts: [] }));
    },

    // Convenience methods for different toast types
    showSuccess: (message: string, title: string = "Success", duration: number = 5000) => {
      return store.addToast({ type: "success", title, message, duration });
    },

    showError: (message: string, title: string = "Error", duration: number = 8000) => {
      return store.addToast({ type: "error", title, message, duration });
    },

    showWarning: (message: string, title: string = "Warning", duration: number = 6000) => {
      return store.addToast({ type: "warning", title, message, duration });
    },

    showInfo: (message: string, title: string = "Info", duration: number = 5000) => {
      return store.addToast({ type: "info", title, message, duration });
    },

    showPayday: (message: string, title: string = "Payday", duration: number = 6000) => {
      return store.addToast({ type: "payday", title, message, duration });
    },
  };

  return store;
});

// Global toast functions that can be called from anywhere
export const globalToast = {
  showSuccess: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().showSuccess(message, title, duration),
  showError: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().showError(message, title, duration),
  showWarning: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().showWarning(message, title, duration),
  showInfo: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().showInfo(message, title, duration),
  showPayday: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().showPayday(message, title, duration),
};

export default useToastStore;
