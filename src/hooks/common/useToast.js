import { useState, useCallback } from "react";

let toastId = 0;

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    ({ type = "info", title, message, duration = 5000 }) => {
      const id = ++toastId;
      const toast = {
        id,
        type,
        title,
        message,
        duration,
      };

      setToasts((prev) => [...prev, toast]);

      return id;
    },
    [],
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const showSuccess = useCallback(
    (title, message, duration) => {
      return addToast({ type: "success", title, message, duration });
    },
    [addToast],
  );

  const showError = useCallback(
    (title, message, duration) => {
      return addToast({ type: "error", title, message, duration });
    },
    [addToast],
  );

  const showWarning = useCallback(
    (title, message, duration) => {
      return addToast({ type: "warning", title, message, duration });
    },
    [addToast],
  );

  const showInfo = useCallback(
    (title, message, duration) => {
      return addToast({ type: "info", title, message, duration });
    },
    [addToast],
  );

  const showPayday = useCallback(
    (title, message, duration = 8000) => {
      return addToast({ type: "payday", title, message, duration });
    },
    [addToast],
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
