import { useState, useEffect } from "react";
import { renderIcon } from "@/utils/icons";

type ToastType = "success" | "error" | "warning" | "info" | "payday";

interface ToastProps {
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

const Toast = ({ type = "info", title, message, duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getToastStyles = () => {
    const baseStyles =
      "transform transition-all duration-300 ease-in-out glassmorphism rounded-2xl p-4 max-w-md shadow-2xl border border-white/30";

    const visibilityStyles = isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0";

    const typeStyles: Record<ToastType, string> = {
      success: "bg-emerald-50/90 border-emerald-200/50",
      error: "bg-red-50/90 border-red-200/50",
      warning: "bg-amber-50/90 border-amber-200/50",
      info: "bg-blue-50/90 border-blue-200/50",
      payday: "bg-purple-50/90 border-purple-200/50",
    };

    return `${baseStyles} ${visibilityStyles} ${typeStyles[type]}`;
  };

  const getIcon = () => {
    const iconStyles = "h-5 w-5 mr-3 flex-shrink-0";

    switch (type) {
      case "success":
        return renderIcon("CheckCircle", {
          className: `${iconStyles} text-emerald-600`,
        });
      case "error":
        return renderIcon("AlertCircle", {
          className: `${iconStyles} text-red-600`,
        });
      case "warning":
        return renderIcon("AlertCircle", {
          className: `${iconStyles} text-amber-600`,
        });
      case "payday":
        return renderIcon("Calendar", {
          className: `${iconStyles} text-purple-600`,
        });
      default:
        return renderIcon("Info", { className: `${iconStyles} text-blue-600` });
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-emerald-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-amber-800";
      case "payday":
        return "text-purple-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {title && <h4 className={`font-semibold text-sm ${getTextColor()}`}>{title}</h4>}
          {message && (
            <p className={`text-sm ${title ? "mt-1" : ""} ${getTextColor()} opacity-90`}>
              {message}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="ml-3 flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          {renderIcon("X", { className: "h-4 w-4 text-gray-500" })}
        </button>
      </div>
    </div>
  );
};

interface ToastItem {
  id: string | number;
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
}

const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string | number) => void;
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer, type ToastItem };
