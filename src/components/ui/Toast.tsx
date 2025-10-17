import React, { useState, useEffect } from "react";
import { renderIcon } from "../../utils/icons";

export type ToastType = "success" | "error" | "warning" | "info" | "payday";

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

export interface ToastData extends Omit<ToastProps, 'onClose'> {
  id: string;
}

const Toast: React.FC<ToastProps> = ({ 
  type = "info", 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
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

  const getToastStyles = (): string => {
    const baseStyles =
      "transform transition-all duration-300 ease-in-out glassmorphism rounded-2xl p-4 max-w-md shadow-2xl border border-white/30";

    const visibilityStyles = isVisible
      ? "translate-x-0 opacity-100"
      : "translate-x-full opacity-0";

    const typeStyles: Record<ToastType, string> = {
      success: "bg-emerald-50/90 border-emerald-200/50",
      error: "bg-red-50/90 border-red-200/50",
      warning: "bg-amber-50/90 border-amber-200/50",
      info: "bg-blue-50/90 border-blue-200/50",
      payday: "bg-purple-50/90 border-purple-200/50",
    };

    return `${baseStyles} ${visibilityStyles} ${typeStyles[type] || typeStyles.info}`;
  };

  const getIcon = () => {
    const iconStyles = "h-5 w-5 mr-3 flex-shrink-0";

    const iconConfig: Record<ToastType, { icon: string; className: string }> = {
      success: { icon: "CheckCircle", className: `${iconStyles} text-emerald-600` },
      error: { icon: "AlertCircle", className: `${iconStyles} text-red-600` },
      warning: { icon: "AlertCircle", className: `${iconStyles} text-amber-600` },
      payday: { icon: "Calendar", className: `${iconStyles} text-purple-600` },
      info: { icon: "Info", className: `${iconStyles} text-blue-600` },
    };

    const config = iconConfig[type] || iconConfig.info;
    return renderIcon(config.icon, { className: config.className });
  };

  const getTextColor = (): string => {
    const textColors: Record<ToastType, string> = {
      success: "text-emerald-800",
      error: "text-red-800",
      warning: "text-amber-800",
      payday: "text-purple-800",
      info: "text-blue-800",
    };

    return textColors[type] || textColors.info;
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold text-sm ${getTextColor()}`}>
              {title}
            </h4>
          )}
          {message && (
            <p
              className={`text-sm ${title ? "mt-1" : ""} ${getTextColor()} opacity-90`}
            >
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

interface ToastContainerProps {
  toasts: ToastData[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
export default Toast;