import { useState, useCallback } from "react";

let toastId = 0;

export type ToastType = "info" | "success" | "error" | "warning" | "payday";

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

export interface AddToastParams {
  type?: ToastType;
  title: string;
  message: string;
  duration?: number;
}

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    ({ type = "info", title, message, duration = 5000 }: AddToastParams): number => {
      const id = ++toastId;
      const toast: Toast = {
        id,
        type,
        title,
        message,
        duration,
      };

      setToasts((prev: Toast[]) => [...prev, toast]);

      return id;
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev: Toast[]) => prev.filter((toast: Toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast({ type: "success", title, message, duration });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast({ type: "error", title, message, duration });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast({ type: "warning", title, message, duration });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      return addToast({ type: "info", title, message, duration });
    },
    [addToast]
  );

  const showPayday = useCallback(
    (title: string, message: string, duration = 8000) => {
      return addToast({ type: "payday", title, message, duration });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPayday,
  };
};

export default useToast;
