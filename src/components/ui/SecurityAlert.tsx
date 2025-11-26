import { createElement, ComponentType } from "react";
import { getIcon as getIconFromRegistry } from "@/utils/icons";

type IconComponentType = ComponentType<{ className?: string }>;

/**
 * Shared security alert component for consistent messaging across security interfaces
 * Provides standardized styling for errors, warnings, success, and info messages
 *
 * @param {string} type - 'error' | 'warning' | 'success' | 'info'
 * @param {string} message - Alert message text
 * @param {React.Component} icon - Optional custom icon component (defaults based on type)
 * @param {boolean} dismissible - Whether alert can be dismissed
 * @param {Function} onDismiss - Handler for dismissing alert
 * @param {string} variant - 'standard' | 'fullscreen' for different contexts
 */
interface SecurityAlertProps {
  type?: "error" | "warning" | "success" | "info";
  message: string;
  icon?: IconComponentType;
  dismissible?: boolean;
  onDismiss?: () => void;
  variant?: "standard" | "fullscreen";
  className?: string;
}

const SecurityAlert = ({
  type = "info",
  message,
  icon: CustomIcon,
  dismissible = false,
  onDismiss,
  variant = "standard",
  className = "",
}: SecurityAlertProps) => {
  // Icon mapping based on alert type
  const getIcon = (): IconComponentType => {
    if (CustomIcon) return CustomIcon;

    switch (type) {
      case "error":
        return getIconFromRegistry("AlertCircle") as IconComponentType;
      case "warning":
        return getIconFromRegistry("AlertTriangle") as IconComponentType;
      case "success":
        return getIconFromRegistry("CheckCircle") as IconComponentType;
      case "info":
      default:
        return getIconFromRegistry("Info") as IconComponentType;
    }
  };

  // Color schemes based on type and variant
  const getColorScheme = () => {
    const isFullscreen = variant === "fullscreen";

    switch (type) {
      case "error":
        return {
          container: isFullscreen
            ? "text-red-300 bg-red-500 bg-opacity-20"
            : "text-red-800 bg-red-50 border-red-200",
          icon: isFullscreen ? "text-red-300" : "text-red-600",
        };
      case "warning":
        return {
          container: isFullscreen
            ? "text-orange-300 bg-orange-500 bg-opacity-20"
            : "text-orange-800 bg-orange-50 border-orange-200",
          icon: isFullscreen ? "text-orange-300" : "text-orange-600",
        };
      case "success":
        return {
          container: isFullscreen
            ? "text-green-300 bg-green-500 bg-opacity-20"
            : "text-green-800 bg-green-50 border-green-200",
          icon: isFullscreen ? "text-green-300" : "text-green-600",
        };
      case "info":
      default:
        return {
          container: isFullscreen
            ? "text-blue-300 bg-blue-500 bg-opacity-20"
            : "text-blue-800 bg-blue-50 border-blue-200",
          icon: isFullscreen ? "text-blue-300" : "text-blue-600",
        };
    }
  };

  const Icon = getIcon();
  const colors = getColorScheme();

  const containerClasses = `
    flex items-center gap-2 p-3 rounded-lg border-2 border-black
    ${colors.container}
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {createElement(Icon, {
        className: `h-4 w-4 flex-shrink-0 ${colors.icon}`,
      })}
      <span className="text-sm flex-1">{message}</span>

      {dismissible && onDismiss && (
        <button onClick={onDismiss} className={`ml-2 hover:opacity-75 ${colors.icon}`}>
          {createElement(getIconFromRegistry("X") as IconComponentType, {
            className: "h-3 w-3",
          })}
        </button>
      )}
    </div>
  );
};

export default SecurityAlert;
